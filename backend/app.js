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
app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
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
app.use("/admin", apiLimiter, adminRoutes);

// Terminal error handler. MUST stay last, after every route.
//
// Express 5 forwards a rejected promise from an async handler straight here,
// and finalhandler then uses `err.status` for the response. An AxiosError
// carries the UPSTREAM status, so a 403 from Splitwise was being replayed to
// the browser as a bare "Forbidden" page with no explanation -- which is
// exactly what users hit when API access lapsed. Never pass an upstream
// status through as our own.
app.use((err, req, res, next) => {
  const upstream = err?.response?.status;
  console.error("Unhandled error", {
    path: req.originalUrl,
    upstream: upstream ?? null,
    message: err?.message,
  });
  if (res.headersSent) return next(err);
  res.status(upstream ? 502 : 500).json({
    error: upstream ? "Upstream service unavailable" : "Internal server error",
  });
});

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
