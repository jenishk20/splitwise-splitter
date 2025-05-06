const userAuth = async (req, res, next) => {
  const access_token = req.cookies.access_token;
  const user_details = req.cookies.user_details;
  if (!access_token || !user_details) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.user = { ...req.user, access_token };
  next();
};

module.exports = { userAuth };
