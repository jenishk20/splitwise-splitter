const userAuth = async (req, res, next) => {
  const access_token = req.cookies.access_token;
  const user_details_raw = req.cookies.user_details;
  try {
    var user_details = JSON.parse(user_details_raw);
  } catch (e) {
    console.log("Error parsing user_details cookie:", e);
    user_details = null;
  }
  if (!access_token || !user_details) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = { user_details, access_token };
  next();
};

module.exports = { userAuth };
