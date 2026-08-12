const mongoose = require("mongoose");

const { Schema } = mongoose;

// Lightweight funnel/analytics events. Append-only; written fire-and-forget,
// never read on the request hot path. Lets us measure the viral loop:
// receipt_uploaded -> invite_sent -> optin_completed -> expense_finalized.
const eventSchema = new Schema(
  {
    type: { type: String, required: true, index: true },
    userId: { type: String, default: null },
    groupId: { type: String, default: null },
    expenseId: { type: String, default: null },
    email: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

const EventModel = mongoose.model("Event", eventSchema);
module.exports = EventModel;
