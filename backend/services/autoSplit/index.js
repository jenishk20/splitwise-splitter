// Auto-split service: the single entry point the API route calls.
//
// Pure function (no DB/network) so it stays unit-testable. The route is
// responsible for loading the expense + the group's history from Mongo and
// passing plain objects in here.

const { canonicalizeItem } = require("./normalize");
const { buildHistoryFromExpenses } = require("./historyBuilder");
const { predictParticipation } = require("./predictor");

// currentItems:    the pending expense's items  [{ item, _id, ... }]
// historyExpenses: the group's OTHER expenses, for learning (exclude current)
// members:         member ids to predict for; if empty, derived from history
//
// Returns one entry per item, aligned by `index` (matches the frontend's
// participation state keyed by item index) and `itemId` for safety:
//   [{ index, itemId, item, category, suggestions: { [memberId]: {...} } }]
function suggestForExpense({ currentItems, historyExpenses, members, now = Date.now() }) {
  const history = buildHistoryFromExpenses(historyExpenses || []);

  const memberIds =
    members && members.length
      ? members.map(String)
      : [...new Set(history.map((o) => o.memberId))];

  const normalizedItems = (currentItems || []).map((it) => {
    const { canonicalItem, category } = canonicalizeItem(it.item);
    return { item: it.item, _id: it._id, canonicalItem, category };
  });

  const predictions = predictParticipation({
    items: normalizedItems,
    members: memberIds,
    history,
    now,
  });

  return predictions.map((p, index) => ({
    index,
    itemId: p.item._id ? String(p.item._id) : null,
    item: p.item.item,
    category: p.item.category,
    suggestions: p.suggestions,
  }));
}

module.exports = { suggestForExpense };
