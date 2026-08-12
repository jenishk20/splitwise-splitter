const mongoose = require("mongoose");

const { Schema } = mongoose;

const expenseSchema = new Schema(
  {
    groupId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    jobId: {
      type: String,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
    },
    preferencesFilled: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    items: [
      {
        item: String,
        quantity: Number,
        price: Number,
        // Mixed, not Boolean: cells now carry provenance as
        // { value, source, at } so the predictor can tell a member's real
        // choice from its own suggestion. Documents written before this change
        // still hold a bare boolean, which readEntry() normalizes on read.
        // See services/autoSplit/participation.js.
        participation: {
          type: Map,
          of: Schema.Types.Mixed,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "settled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ExpenseModel = mongoose.model("Expense", expenseSchema);
module.exports = ExpenseModel;
