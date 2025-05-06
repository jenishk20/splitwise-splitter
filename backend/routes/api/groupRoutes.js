const express = require("express");
const { default: axios } = require("axios");
const router = express.Router();

router.get("/fetchUserGroups", async (req, res) => {
  const { access_token } = req.query;
  try {
    const groups = await getUserGroups(access_token);
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user groups" });
  }
});
const getUserGroups = async (access_token) => {
  try {
    const response = await axios.get(
      "https://secure.splitwise.com/api/v3.0/get_groups",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch groups");
  }
};

module.exports = router;
