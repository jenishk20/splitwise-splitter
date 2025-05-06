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

router.get("/auth", (req, res) => {
  const url = getAuthURL();
  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;
  const tokens = await getToken(code);
  const user = await getCurrentUser(tokens.access_token);
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
  const redirectURL = `${frontendURL}/?access_token=${
    tokens.access_token
  }&first_name=${encodeURIComponent(user?.user?.first_name)}`;
  console.log("Redicrect URL is ", redirectURL);
  res.redirect(redirectURL);
});

module.exports = router;
