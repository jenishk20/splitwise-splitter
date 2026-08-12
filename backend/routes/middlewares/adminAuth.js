const { getCurrentUser } = require("../../services/splitwiseService");
const { isAdminId } = require("../../utils/adminAllowlist");

// Guards the admin routes, which expose every user's name and email.
//
// Identity is resolved from the httpOnly Splitwise access_token, NOT from the
// user_details cookie: that cookie is written with httpOnly: false so the
// frontend can read it, which means the client can also rewrite it and claim
// any splitwiseId (or isAdmin: true). Only the access_token is unforgeable.
const adminAuth = async (req, res, next) => {
  const access_token = req.cookies.access_token;
  if (!access_token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const me = await getCurrentUser(access_token);
    const splitwiseId = me?.user?.id;

    if (!splitwiseId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!isAdminId(splitwiseId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.admin = { splitwiseId: String(splitwiseId) };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { adminAuth };
