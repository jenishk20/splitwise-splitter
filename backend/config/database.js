const mongoose = require("mongoose");
const connect = async () => {
  await mongoose.connect(
    "mongodb+srv://jkothari2001:jenishk@insurance-data.im53i.mongodb.net/splitwise"
  );
};

module.exports = { connect };
