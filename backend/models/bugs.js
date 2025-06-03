const mongoose = require("mongoose");

const { Schema } = mongoose;

const bugSchema = new Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  reporterName: { type: String, required: true },
  reporterEmail: { type: String, required: true },
});

const BugModel = mongoose.model("Bug", bugSchema);
module.exports = { BugModel };
