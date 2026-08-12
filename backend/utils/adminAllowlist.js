const dotenv = require("dotenv");
dotenv.config();

// Comma-separated Splitwise user ids allowed to reach the /admin routes.
// Fails closed: an unset or empty list means nobody is an admin.
const getAdminIds = () =>
  (process.env.ADMIN_SPLITWISE_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

const isAdminId = (id) => id != null && getAdminIds().includes(String(id));

module.exports = { getAdminIds, isAdminId };
