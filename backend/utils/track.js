const EventModel = require("../models/event");

// Fire-and-forget analytics. Tracking can NEVER throw into or slow down the
// main request flow: the returned promise is already .catch()'d, so callers
// invoke `track(...)` WITHOUT awaiting and nothing can break or block.
function track(type, data = {}) {
  return EventModel.create({ type, ...data }).catch((err) => {
    console.error(`track(${type}) failed (non-fatal):`, err.message);
  });
}

module.exports = { track };
