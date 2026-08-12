const dotenv = require("dotenv");
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

// Splitwise OAuth2 access tokens are long-lived, but this cookie used to expire
// after a single day — which logged every returning user out and forced them
// back through the full OAuth consent redirect just to reopen a receipt. That
// re-auth wall is the main reason sessions never survived to a second visit.
const SESSION_DAYS = Number(process.env.SESSION_DAYS) || 30;

const commonCookieSettings = {
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  secure: isProd,
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
};

const cookieOptions = {
  accessToken: {
    ...commonCookieSettings,
    httpOnly: true,
  },
  userDetails: {
    ...commonCookieSettings,
    httpOnly: false,
  },
};

module.exports = cookieOptions;
