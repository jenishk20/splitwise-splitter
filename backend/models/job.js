const mongoose = require("mongoose");

const { Schema } = mongoose;

const jobSchema = new Schema({
  status: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    default: {},
  },
  error: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const JobModel = mongoose.model("Job", jobSchema);

module.exports = JobModel;
