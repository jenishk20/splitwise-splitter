// Run: node --test backend/services/autoSplit/
const { test } = require("node:test");
const assert = require("node:assert");
const { predictParticipation } = require("./predictor");
const { canonicalizeItem } = require("./normalize");
const { buildHistoryFromExpenses } = require("./historyBuilder");

const NOW = new Date("2026-06-07").getTime();
const daysAgo = (n) => NOW - n * 24 * 60 * 60 * 1000;

// Helper: build N observations of one member/category at a given recency.
function obs(memberId, canonicalItem, category, optedIn, count, ts = daysAgo(7)) {
  return Array.from({ length: count }, () => ({
    memberId,
    canonicalItem,
    category,
    optedIn,
    timestamp: ts,
  }));
}

function predictFor(canonicalItem, category, members, history) {
  const [{ suggestions }] = predictParticipation({
    items: [{ item: canonicalItem, canonicalItem, category }],
    members,
    history,
    now: NOW,
  });
  return suggestions;
}

test("cold start: no history => no suggestions, safe default (unchecked)", () => {
  const s = predictFor("milk", "dairy", ["yash"], []);
  assert.equal(s.yash.suggested, false);
  assert.equal(s.yash.checked, false);
});

test("strong positive: 5/5 opt-ins => pre-checked with reason", () => {
  const history = obs("yash", "milk", "dairy", true, 5);
  const s = predictFor("milk", "dairy", ["yash"], history);
  assert.equal(s.yash.suggested, true);
  assert.equal(s.yash.checked, true);
  assert.ok(s.yash.probability > 0.6, `p=${s.yash.probability}`);
  assert.match(s.yash.reason, /milk/);
});

test("strong negative: 0/5 opt-ins => confident leave-unchecked", () => {
  const history = obs("yash", "beer", "alcohol", false, 5);
  const s = predictFor("beer", "alcohol", ["yash"], history);
  assert.equal(s.yash.suggested, true);
  assert.equal(s.yash.checked, false);
  assert.ok(s.yash.probability < 0.2, `p=${s.yash.probability}`);
});

test("category backoff: unseen item, but member always takes that category", () => {
  // Member has history on "whole milk", receipt has the never-seen "almond milk".
  const history = obs("yash", "whole milk", "dairy", true, 4);
  const s = predictFor("almond milk", "dairy", ["yash"], history);
  assert.equal(s.yash.suggested, true);
  assert.equal(s.yash.checked, true);
  assert.match(s.yash.reason, /dairy/); // reason falls back to category
});

test("single observation is not enough evidence => abstain", () => {
  const history = obs("yash", "kombucha", "beverage", true, 1);
  const s = predictFor("kombucha", "beverage", ["yash"], history);
  assert.equal(s.yash.suggested, false); // 1 < minEvidence(2)
});

test("recency: recent opt-outs outweigh old opt-ins", () => {
  const history = [
    ...obs("yash", "beer", "alcohol", true, 3, daysAgo(400)), // stale habit
    ...obs("yash", "beer", "alcohol", false, 3, daysAgo(5)), // current habit
  ];
  const s = predictFor("beer", "alcohol", ["yash"], history);
  assert.ok(s.yash.probability < 0.5, `p=${s.yash.probability}`);
});

test("per-member: shared staple checked for all, niche item only for its fan", () => {
  const history = [
    // Everyone splits paper towels.
    ...obs("yash", "paper towel", "household", true, 4),
    ...obs("raj", "paper towel", "household", true, 4),
    // Only raj drinks the beer.
    ...obs("yash", "beer", "alcohol", false, 4),
    ...obs("raj", "beer", "alcohol", true, 4),
  ];
  const towels = predictFor("paper towel", "household", ["yash", "raj"], history);
  assert.equal(towels.yash.checked, true);
  assert.equal(towels.raj.checked, true);

  const beer = predictFor("beer", "alcohol", ["yash", "raj"], history);
  assert.equal(beer.yash.checked, false);
  assert.equal(beer.raj.checked, true);
});

test("normalize: collapses noisy receipt strings to category", () => {
  // Full-word strings categorize correctly off the deterministic baseline.
  assert.equal(canonicalizeItem("Organic Whole Milk").category, "dairy");
  assert.equal(canonicalizeItem("Coors Light Beer 12pk").category, "alcohol");
  // Sizes/packaging are stripped from the canonical key.
  assert.equal(canonicalizeItem("Whole Milk 1 GAL").canonicalItem, "whole milk");

  // KNOWN LIMITATION: heavy abbreviations ("MLK", "GV CHX") defeat keyword
  // matching and fall through to "other". This is the precise case the
  // LLM-backed normalizer (swap-in at normalize.canonicalizeItem) is for.
  assert.equal(canonicalizeItem("MLK 2% GAL").category, "other");
});

test("historyBuilder: only learns from members who engaged", () => {
  const expenses = [
    {
      createdAt: new Date(daysAgo(3)),
      preferencesFilled: { yash: true }, // only yash filled prefs
      items: [
        {
          item: "Whole Milk",
          // raj is "true" by default but never engaged => must be ignored
          participation: { yash: true, raj: true },
        },
      ],
    },
  ];
  const history = buildHistoryFromExpenses(expenses);
  const members = [...new Set(history.map((o) => o.memberId))];
  assert.deepEqual(members, ["yash"]); // raj's default is not learned from
  assert.equal(history[0].category, "dairy");
  assert.equal(history[0].optedIn, true);
});
