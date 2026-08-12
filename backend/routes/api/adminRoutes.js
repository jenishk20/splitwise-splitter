const express = require("express");
const router = express.Router();
const UserModel = require("../../models/user");
const BugModel = require("../../models/bugs");
const ExpenseModel = require("../../models/expense");
const InvoiceJobModel = require("../../models/invoicejob");
const { adminAuth } = require("../middlewares/adminAuth");

// Deliberately public: aggregate counts only, no personal data. The landing
// page renders these for anonymous visitors. Every other route below exposes
// user data and must stay behind adminAuth.
router.get("/public-stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalReceipts,
      totalExpenses,
      settledExpenses,
      amountAgg,
    ] = await Promise.all([
      UserModel.countDocuments(),
      InvoiceJobModel.countDocuments({ status: "Done" }),
      ExpenseModel.countDocuments(),
      ExpenseModel.countDocuments({ status: "settled" }),
      ExpenseModel.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: [
                  "$items.price",
                  { $ifNull: ["$items.quantity", 1] },
                ],
              },
            },
          },
        },
      ]),
    ]);

    res.json({
      totalUsers,
      totalReceipts,
      totalExpenses,
      settledExpenses,
      totalAmountSplit: Math.round((amountAgg[0]?.total || 0) * 100) / 100,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching public statistics",
      error: error.message,
    });
  }
});

// Get user registration statistics
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate(),
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
router.get("/users", adminAuth, async (req, res) => {
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
router.get("/bugs", adminAuth, async (req, res) => {
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
