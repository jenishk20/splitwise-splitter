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
const cookieOptions = require("../../utils/cookieOptions");

router.get("/auth", (req, res) => {
  const url = getAuthURL();
  res.redirect(url);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!code) {
    return res.redirect(`${frontendURL}/?auth_error=missing_code`);
  }

  try {
    const tokens = await getToken(code);
    let user = await getCurrentUser(tokens.access_token);
    if (user && user?.user) {
      user.user.isAdmin = true;
    }
    const access_token = tokens.access_token;
    res.cookie("access_token", access_token, cookieOptions.accessToken);
    res.cookie("user_details", JSON.stringify(user), cookieOptions.userDetails);

    const { id, first_name, last_name, email, isAdmin } = user?.user;
    const userDetails = {
      splitwiseId: id,
      firstName: first_name,
      lastName: last_name,
      email: email,
      isAdmin: isAdmin,
    };
    const existingUser = await UserModel.findOne({ splitwiseId: id });
    if (!existingUser) {
      const newUser = new UserModel(userDetails);
      await newUser.save();
    } else {
      await UserModel.updateOne({ splitwiseId: id }, userDetails);
    }
    return res.redirect(`${frontendURL}/dashboard`);
  } catch (err) {
    // This handler used to be unguarded, so a failure from Splitwise reached
    // Express 5's finalhandler and was replayed verbatim -- users saw a blank
    // page reading only "Forbidden".
    const status = err?.response?.status;

    // 403 means Splitwise accepted the code and then refused the API call.
    // Since 2026-09-01 that is what an inactive Splitwise Pro subscription on
    // the app owner's account looks like: OAuth still redirects fine, but the
    // API is closed. An expired or replayed single-use code gives 400 instead.
    const reason =
      status === 403
        ? "integration_unavailable"
        : status === 400
        ? "invalid_or_expired_code"
        : "auth_failed";

    console.error("OAuth callback failed", {
      status: status ?? null,
      reason,
      message: err?.message,
      body: err?.response?.data ?? null,
    });

    return res.redirect(`${frontendURL}/?auth_error=${reason}`);
  }
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
  res.clearCookie("access_token", cookieOptions.accessToken);
  res.clearCookie("user_details", cookieOptions.userDetails);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
