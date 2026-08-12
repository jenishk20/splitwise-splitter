// Adapter: turn stored Expense documents into the flat observation list the
// predictor consumes.
//
// Data-quality rule: only genuine human choices become observations. A cell
// that the predictor pre-filled and the member simply submitted is not
// evidence -- treating it as evidence is what let the model confirm its own
// guesses. See services/autoSplit/participation.js for the provenance model.

const { canonicalizeItem } = require("./normalize");
const {
  SOURCES,
  readEntry,
  isTrainable,
} = require("./participation");

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
    const timestamp = expense.updatedAt || expense.createdAt || null;

    for (const rawItem of expense.items || []) {
      const { canonicalItem, category } = canonicalizeItem(rawItem.item);
      const participation = toPlainObject(rawItem.participation);

      for (const [memberId, raw] of Object.entries(participation)) {
        const entry = readEntry(raw);
        if (!isTrainable(entry)) continue;

        // A pre-provenance boolean says nothing about where it came from, so
        // fall back to the old coarse signal: trust it only if that member
        // actually engaged with the expense. Newer USER entries are already
        // precise and need no such guard.
        if (entry.source === SOURCES.LEGACY && !filled[memberId]) continue;

        observations.push({
          memberId: String(memberId),
          canonicalItem,
          category,
          optedIn: entry.value,
          timestamp,
        });
      }
    }
  }

  return observations;
}

module.exports = { buildHistoryFromExpenses };
