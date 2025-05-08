const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const { default: axios } = require("axios");
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
  console.log("For the token user the response is ", user);
  res.cookie("access_token", access_token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.cookie("user_details", JSON.stringify(user), {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
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
  const user_details = req.cookies.user_details;
  console.log("Here in User Details", req.cookies);

  try {
    if (!user_details) throw new Error("No user cookie");

    const parsed = JSON.parse(user_details);
    res.json(parsed);
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
});

module.exports = router;
