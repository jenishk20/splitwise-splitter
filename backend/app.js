const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const { userAuth } = require("./routes/middlewares/userAuth");
const { connect } = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const {
  loginLimiter,
  apiLimiter,
} = require("./routes/middlewares/rateLimiter");

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
const jobRoutes = require("./routes/api/jobRoutes");
const bugRoutes = require("./routes/api/bugRoutes");
const adminRoutes = require("./routes/api/adminRoutes");

app.use("/login", loginLimiter, loginRoutes);
app.use("/upload", userAuth, apiLimiter, fileUploadRoutes);
app.use("/groups", userAuth, apiLimiter, groupRoutes);
app.use("/expenses", userAuth, apiLimiter, expenseRoutes);
app.use("/jobs", userAuth, apiLimiter, jobRoutes);
app.use("/bug-reports", userAuth, apiLimiter, bugRoutes);
app.use("/admin", adminRoutes);

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
