// Adapter: turn stored Expense documents into the flat observation list the
// predictor consumes.
//
// Data-quality rule (important): we only learn from a member on an expense
// where that member ACTUALLY engaged — i.e. preferencesFilled[memberId] === true.
// At submit time every item's participation defaults to "creator only"
// (see expenseRoutes.submit-expense), so an untouched checkbox is the default,
// NOT a real preference. Learning from defaults would just teach the model the
// default. We ignore those and keep only genuine signal.

const { canonicalizeItem } = require("./normalize");

function toPlainObject(mapOrObj) {
  if (!mapOrObj) return {};
  if (mapOrObj instanceof Map) return Object.fromEntries(mapOrObj);
  // Mongoose Map sometimes deserializes as a plain object already.
  return typeof mapOrObj.toObject === "function" ? mapOrObj.toObject() : mapOrObj;
}

// expenses: array of Expense docs (lean objects or Mongoose docs) for ONE group.
// Returns: [{ memberId, canonicalItem, category, optedIn, timestamp }]
function buildHistoryFromExpenses(expenses) {
  const observations = [];

  for (const expense of expenses) {
    const filled = toPlainObject(expense.preferencesFilled);
    const engagedMembers = Object.keys(filled).filter((id) => filled[id]);
    if (engagedMembers.length === 0) continue;

    const timestamp = expense.updatedAt || expense.createdAt || null;

    for (const rawItem of expense.items || []) {
      const { canonicalItem, category } = canonicalizeItem(rawItem.item);
      const participation = toPlainObject(rawItem.participation);

      for (const memberId of engagedMembers) {
        observations.push({
          memberId: String(memberId),
          canonicalItem,
          category,
          optedIn: !!participation[memberId],
          timestamp,
        });
      }
    }
  }

  return observations;
}

module.exports = { buildHistoryFromExpenses };
