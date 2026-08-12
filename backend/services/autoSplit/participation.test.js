// Run: node --test backend/services/autoSplit/participation.test.js
//
// The invariant this file exists to protect: the predictor must never learn
// from its own suggestions. Before provenance existed, a pre-filled cell that
// a member simply submitted was stored as a plain `true` and read back as
// evidence, so the model kept confirming its own guesses.

const { test } = require("node:test");
const assert = require("node:assert");
const { SOURCES, readEntry, makeEntry, isTrainable, canWrite } = require("./participation");
const { buildHistoryFromExpenses } = require("./historyBuilder");

test("readEntry normalizes legacy booleans and new cells alike", () => {
  assert.deepStrictEqual(readEntry(true), { value: true, source: SOURCES.LEGACY });
  assert.deepStrictEqual(readEntry(false), { value: false, source: SOURCES.LEGACY });
  assert.deepStrictEqual(readEntry(undefined), { value: false, source: SOURCES.DEFAULT });

  const cell = readEntry({ value: true, source: SOURCES.SUGGESTED, at: null });
  assert.strictEqual(cell.value, true);
  assert.strictEqual(cell.source, SOURCES.SUGGESTED);

  // An object with no source came from somewhere untagged: treat as legacy,
  // never silently promote it to a user declaration.
  assert.strictEqual(readEntry({ value: true }).source, SOURCES.LEGACY);
});

test("only genuine choices are trainable", () => {
  assert.ok(isTrainable(readEntry(makeEntry(true, SOURCES.USER))));
  assert.ok(isTrainable(readEntry(true))); // legacy
  assert.ok(!isTrainable(readEntry(makeEntry(true, SOURCES.SUGGESTED))));
  assert.ok(!isTrainable(readEntry(makeEntry(true, SOURCES.DEFAULT))));
});

test("canWrite: own cell, or the creator acting for the group", () => {
  assert.ok(canWrite({ actorId: "1", memberId: "1", expenseCreatorId: "9" }));
  assert.ok(canWrite({ actorId: "9", memberId: "1", expenseCreatorId: "9" }));
  assert.ok(!canWrite({ actorId: "2", memberId: "1", expenseCreatorId: "9" }));
  // ids arrive as both numbers and strings depending on the caller
  assert.ok(canWrite({ actorId: 1, memberId: "1", expenseCreatorId: 9 }));
});

test("suggested cells never become training observations", () => {
  const expenses = [
    {
      preferencesFilled: { alice: true, bob: true },
      updatedAt: new Date("2026-06-01"),
      items: [
        {
          item: "Whole Milk 2L",
          participation: {
            // alice actually ticked this
            alice: makeEntry(true, SOURCES.USER),
            // bob's was pre-filled by the model and submitted untouched
            bob: makeEntry(true, SOURCES.SUGGESTED),
          },
        },
      ],
    },
  ];

  const history = buildHistoryFromExpenses(expenses);
  const members = history.map((o) => o.memberId);

  assert.deepStrictEqual(members, ["alice"]);
  assert.strictEqual(history[0].optedIn, true);
});

test("defaults written at submit time are not evidence", () => {
  const expenses = [
    {
      preferencesFilled: { carol: true },
      updatedAt: new Date("2026-06-01"),
      items: [
        {
          item: "Beer 6pk",
          participation: {
            // the payer-only default from submit-expense
            carol: makeEntry(true, SOURCES.DEFAULT),
            dave: makeEntry(false, SOURCES.DEFAULT),
          },
        },
      ],
    },
  ];

  assert.deepStrictEqual(buildHistoryFromExpenses(expenses), []);
});

test("legacy booleans still require the coarse engaged-member guard", () => {
  const expenses = [
    {
      // erin engaged; frank never opened the expense
      preferencesFilled: { erin: true },
      updatedAt: new Date("2026-06-01"),
      items: [{ item: "Bread", participation: { erin: true, frank: true } }],
    },
  ];

  const history = buildHistoryFromExpenses(expenses);
  assert.deepStrictEqual(
    history.map((o) => o.memberId),
    ["erin"]
  );
});
