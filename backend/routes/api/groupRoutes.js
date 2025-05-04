const express = require("express");
const router = express.Router();

router.get("/fetchUserGroups", async (req, res) => {
  const { access_token } = req.query;
  try {
    const groups = await getUserGroups(access_token);
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ error: "Failed to fetch user groups" });
  }
});
const getUserGroups = async (access_token) => {
  const response = await axios.get(
    "https://api.splitwise.com/api/v3.0/get_groups",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return response.data;
};

module.exports = router;
