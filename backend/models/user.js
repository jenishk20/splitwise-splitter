const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    splitwiseId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    jobs: {
      type: [Schema.Types.ObjectId],
      ref: "Job",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
