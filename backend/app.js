const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const { userAuth } = require("./routes/middlewares/userAuth");
const { connect } = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");

app.use(cookieParser());
console.log("CORS enabled for:", process.env.FRONTEND_URL);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.use(express.json());

const loginRoutes = require("./routes/auth/loginRoutes");
const fileUploadRoutes = require("./routes/api/fileUploadRoutes");
const groupRoutes = require("./routes/api/groupRoutes");
const expenseRoutes = require("./routes/api/expenseRoutes");

app.use("/login", loginRoutes);
app.use("/upload", userAuth, fileUploadRoutes);
app.use("/groups", userAuth, groupRoutes);
app.use("/expenses", userAuth, expenseRoutes);

app.listen(process.env.PORT, () => {
  connect()
    .then(() => {
      console.log("Connected to MongoDB");
      console.log(`Server is running on port ${process.env.PORT}`);
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
});
