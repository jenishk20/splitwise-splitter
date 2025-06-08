const express = require("express");
const router = express.Router();
const UserModel = require("../../models/user");
const BugModel = require("../../models/bugs");

// Get user registration statistics
router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );

    const totalUsers = await UserModel.countDocuments();
    const newUsers = await UserModel.countDocuments({
      createdAt: { $gte: lastMonth },
    });

    const totalBugs = await BugModel.countDocuments();

    res.json({
      totalUsers,
      newUsersLastMonth: newUsers,
      totalBugs,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching statistics", error: error.message });
  }
});

// Get detailed user registration data
router.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find()
      .select("firstName lastName email createdAt")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

// Get all bug reports
router.get("/bugs", async (req, res) => {
  try {
    const bugs = await BugModel.find().sort({ _id: -1 }); // Assuming _id contains timestamp

    res.json(bugs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bugs", error: error.message });
  }
});

module.exports = router;
