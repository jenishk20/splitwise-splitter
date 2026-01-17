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
        participation: {
          type: Map,
          of: Boolean,
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
