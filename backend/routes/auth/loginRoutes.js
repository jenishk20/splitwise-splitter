const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const {
  getAuthURL,
  getToken,
  getCurrentUser,
} = require("../../services/splitwiseService");
const UserModel = require("../../models/user");

router.get("/auth", (req, res) => {
  const url = getAuthURL();
  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;
  const tokens = await getToken(code);
  const user = await getCurrentUser(tokens.access_token);
  const access_token = tokens.access_token;
  res.cookie("access_token", access_token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  res.cookie("user_details", JSON.stringify(user), {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  const { id, first_name, last_name, email } = user?.user;
  const userDetails = {
    splitwiseId: id,
    firstName: first_name,
    lastName: last_name,
    email: email,
  };
  const existingUser = await UserModel.findOne({ splitwiseId: id });
  if (!existingUser) {
    const newUser = new UserModel(userDetails);
    await newUser.save();
  } else {
    await UserModel.updateOne({ splitwiseId: id }, userDetails);
  }
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(frontendURL);
});

router.get("/me", async (req, res) => {
  try {
    const user_details = req.cookies.user_details;
    if (!user_details) throw new Error("No user cookie");
    const parsed = JSON.parse(user_details);
    res.json(parsed);
  } catch (e) {
    res.status(401).json({ message: "Unauthorized", details: e.message });
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("user_details");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
