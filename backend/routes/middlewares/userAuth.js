const userAuth = async (req, res, next) => {
  if (!req.query.access_token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.user = { ...req.user, access_token: req.query.access_token };
  next();
};

module.exports = { userAuth };
