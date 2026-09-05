// Provenance for a single (item, member) participation cell.
//
// A cell records whether a member is in on a line item. Storing a bare boolean
// loses WHY: "Jasmine ticked this" and "nobody has answered yet, so this is
// the submit-time payer-only default" both collapse to false. Keeping the
// source lets the UI tell who has genuinely responded, and keeps a default
// from ever being mistaken for a decision.
//
// (This originally existed to stop the auto-split predictor training on its
// own suggestions. The predictor is gone; the distinction is still worth
// keeping, and reading old documents correctly requires it either way.)

const SOURCES = {
  // The member set this themselves.
  USER: "user",
  // Written at submit-expense time, before anyone has said anything.
  DEFAULT: "default",
  // A bare boolean from a document written before provenance existed.
  LEGACY: "legacy",
};

// Documents written before this change store Map<memberId, Boolean>; newer ones
// store Map<memberId, { value, source, at }>. Read both shapes.
function readEntry(raw) {
  if (raw == null) return { value: false, source: SOURCES.DEFAULT };
  if (typeof raw === "boolean") return { value: raw, source: SOURCES.LEGACY };
  return {
    value: !!raw.value,
    source: raw.source || SOURCES.LEGACY,
    at: raw.at || null,
  };
}

function makeEntry(value, source, at = new Date()) {
  return { value: !!value, source, at };
}

// Who may write member M's cell on this expense: M themselves, or the expense
// creator filling in on behalf of the group.
function canWrite({ actorId, memberId, expenseCreatorId }) {
  return (
    String(actorId) === String(memberId) ||
    String(actorId) === String(expenseCreatorId)
  );
}

module.exports = { SOURCES, readEntry, makeEntry, canWrite };
