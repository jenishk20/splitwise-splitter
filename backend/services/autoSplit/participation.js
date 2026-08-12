// Provenance for a single (item, member) participation cell.
//
// The predictor learns from stored participation. Before this module existed a
// cell was a bare boolean, so "Jasmine ticked this", "the model guessed this"
// and "this is the submit-time default" were indistinguishable once written.
// The model's own guesses were therefore fed back to it as observations, and
// because the estimator is recency-weighted those self-generated rows
// outweighed the genuine older ones -- a ratchet that grew more confident the
// more it guessed.
//
// Storing where a value came from is what breaks that loop.

const SOURCES = {
  // The member explicitly set this, or submitted it with no suggestion on it.
  USER: "user",
  // Pre-filled by the predictor and submitted without being touched. Real
  // enough to honour when splitting the bill, too weak to learn from.
  SUGGESTED: "suggested",
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

// Only genuine human choices train the predictor.
//
// LEGACY is included deliberately: it is a fixed, finite set written before the
// feature shipped, and excluding it would leave the model with nothing to learn
// from. It cannot grow, so it cannot ratchet. SUGGESTED is excluded -- that is
// precisely the model's own output coming back around.
function isTrainable(entry) {
  return entry.source === SOURCES.USER || entry.source === SOURCES.LEGACY;
}

// Who may write member M's cell on this expense: M themselves, or the expense
// creator filling in on behalf of the group.
function canWrite({ actorId, memberId, expenseCreatorId }) {
  return (
    String(actorId) === String(memberId) ||
    String(actorId) === String(expenseCreatorId)
  );
}

module.exports = { SOURCES, readEntry, makeEntry, isTrainable, canWrite };
