const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceJobModel = new Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    groupId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Uploading",
    },
    parsedResult: {
      type: Schema.Types.Mixed,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const InvoiceJobModel = new mongoose.model("InvoiceJobs", invoiceJobModel);
module.exports = InvoiceJobModel;
