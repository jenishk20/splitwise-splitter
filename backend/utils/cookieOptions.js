const dotenv = require("dotenv");
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const commonCookieSettings = {
  sameSite: "none",
  secure: isProd,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
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
