// Run: node --test backend/utils/participation.test.js

const { test } = require("node:test");
const assert = require("node:assert");
const { SOURCES, readEntry, makeEntry, canWrite } = require("./participation");
const { computeUserShares } = require("./costSplitter");

test("readEntry normalizes legacy booleans and new cells alike", () => {
  assert.deepStrictEqual(readEntry(true), { value: true, source: SOURCES.LEGACY });
  assert.deepStrictEqual(readEntry(false), { value: false, source: SOURCES.LEGACY });
  assert.deepStrictEqual(readEntry(undefined), { value: false, source: SOURCES.DEFAULT });

  const cell = readEntry(makeEntry(true, SOURCES.USER));
  assert.strictEqual(cell.value, true);
  assert.strictEqual(cell.source, SOURCES.USER);

  // An object with no source came from somewhere untagged: treat as legacy,
  // never silently promote it to a user declaration.
  assert.strictEqual(readEntry({ value: true }).source, SOURCES.LEGACY);
});

test("canWrite: own cell, or the creator acting for the group", () => {
  assert.ok(canWrite({ actorId: "1", memberId: "1", expenseCreatorId: "9" }));
  assert.ok(canWrite({ actorId: "9", memberId: "1", expenseCreatorId: "9" }));
  assert.ok(!canWrite({ actorId: "2", memberId: "1", expenseCreatorId: "9" }));
  // ids arrive as both numbers and strings depending on the caller
  assert.ok(canWrite({ actorId: 1, memberId: "1", expenseCreatorId: 9 }));
});

// The split reads cells through readEntry. A cell is now an OBJECT, and
// `{ value: false }` is truthy -- a bare truthiness test here would opt every
// member into every item and post that to Splitwise.
test("computeUserShares counts only cells whose value is true", () => {
  const items = [
    {
      price: 30,
      participation: {
        alice: makeEntry(true, SOURCES.USER),
        bob: makeEntry(true, SOURCES.USER),
        carol: makeEntry(false, SOURCES.DEFAULT),
      },
    },
  ];

  const { totalCost, userShares } = computeUserShares(items, "alice");
  assert.strictEqual(totalCost, 30);
  assert.deepStrictEqual(Object.keys(userShares).sort(), ["alice", "bob"]);
  assert.strictEqual(userShares.alice, 15);
  assert.strictEqual(userShares.bob, 15);
});

test("computeUserShares still reads pre-provenance boolean documents", () => {
  const items = [{ price: 10, participation: { alice: true, bob: false } }];
  const { userShares } = computeUserShares(items, "alice");
  assert.deepStrictEqual(userShares, { alice: 10 });
});
