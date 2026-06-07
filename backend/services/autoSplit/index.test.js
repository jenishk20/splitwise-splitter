// Run: node --test backend/services/autoSplit/index.test.js
// Exercises the full route-glue path with Expense docs shaped like .lean()
// results from Mongo (Map fields come back as plain objects).
const { test } = require("node:test");
const assert = require("node:assert");
const { suggestForExpense } = require("./index");

const NOW = new Date("2026-06-07").getTime();
const daysAgo = (n) => new Date(NOW - n * 24 * 60 * 60 * 1000);

// Three past grocery runs: yash always takes the milk, raj always the beer.
const historyExpenses = [1, 2, 3].map((i) => ({
  _id: `e${i}`,
  groupId: "g1",
  createdAt: daysAgo(i * 7),
  preferencesFilled: { yash: true, raj: true },
  items: [
    { item: "Whole Milk", participation: { yash: true, raj: false } },
    { item: "Beer 6 pack", participation: { yash: false, raj: true } },
  ],
}));

test("suggestForExpense: learns each member's habit on a new receipt", () => {
  const result = suggestForExpense({
    currentItems: [
      { _id: "i1", item: "Organic 2% Milk" },
      { _id: "i2", item: "Coors Beer" },
    ],
    historyExpenses,
    members: ["yash", "raj"],
    now: NOW,
  });

  const milk = result.find((r) => r.item === "Organic 2% Milk");
  const beer = result.find((r) => r.item === "Coors Beer");

  // Item identity is preserved for the frontend.
  assert.equal(milk.index, 0);
  assert.equal(milk.itemId, "i1");
  assert.equal(milk.category, "dairy");

  // Habits transfer to the new, differently-named items via category.
  assert.equal(milk.suggestions.yash.checked, true);
  assert.equal(milk.suggestions.raj.checked, false);
  assert.equal(beer.suggestions.yash.checked, false);
  assert.equal(beer.suggestions.raj.checked, true);
});

test("suggestForExpense: members default to those seen in history", () => {
  const result = suggestForExpense({
    currentItems: [{ _id: "i1", item: "Whole Milk" }],
    historyExpenses,
    members: [], // not provided -> derive from history
    now: NOW,
  });
  const ids = Object.keys(result[0].suggestions).sort();
  assert.deepEqual(ids, ["raj", "yash"]);
});

test("suggestForExpense: empty history => no suggestions (safe default)", () => {
  const result = suggestForExpense({
    currentItems: [{ _id: "i1", item: "Whole Milk" }],
    historyExpenses: [],
    members: ["yash"],
    now: NOW,
  });
  assert.equal(result[0].suggestions.yash.suggested, false);
  assert.equal(result[0].suggestions.yash.checked, false);
});
