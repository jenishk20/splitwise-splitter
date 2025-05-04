const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const { userAuth } = require("./routes/middlewares/userAuth");
const app = express();
app.use(cors());
app.use(express.json());

const loginRoutes = require("./routes/auth/loginRoutes");
const fileUploadRoutes = require("./routes/api/fileUploadRoutes");
const groupRoutes = require("./routes/api/groupRoutes");
app.use("/login", loginRoutes);
app.use("/upload", userAuth, fileUploadRoutes);
app.use("/groups", userAuth, groupRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
