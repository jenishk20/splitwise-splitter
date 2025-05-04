const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const { default: axios } = require("axios");
dotenv.config();
const {
  getAuthURL,
  getToken,
  getCurrentUser,
} = require("../services/splitwiseService");

router.get("/auth", (req, res) => {
  console.log("Received auth request");
  const url = getAuthURL();
  console.log("Redirecting to:", url);
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
  res.redirect(redirectURL);
});

router.get("/groups", async (req, res) => {
  const accessToken = req.query.access_token;

  if (!accessToken) {
    return res.status(400).json({ error: "Access token required" });
  }
  console.log(accessToken);

  try {
    const response = await axios.get(
      "https://secure.splitwise.com/api/v3.0/get_groups",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching groups:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

module.exports = router;
