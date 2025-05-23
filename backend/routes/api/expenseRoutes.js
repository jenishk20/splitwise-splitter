const express = require("express");
const router = express.Router();
const ExpenseModel = require("../../models/expense");
const { computeUserShares } = require("../../utils/costSplitter");
const { postToSplitwise } = require("../../services/splitwiseService");

router.get("/get-expenses/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const expenses = await ExpenseModel.find({ groupId, status: "pending" });
    res.json(expenses);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch expenses", details: err.message });
  }
});

router.post("/submit-expense", async (req, res) => {
  const { group, items, description } = req.body;
  const userSplitWiseId = req?.user?.user_details?.user?.id;
  const userName = req?.user?.user_details?.user?.first_name;
  try {
    const groupMembers = group.members.map((m) => m.id.toString());
    const sanitizedItems = items.map((item) => {
      const cleanedPrice = parseFloat(
        typeof item.price === "string"
          ? item.price.replace(/[$,]/g, "")
          : item.price
      );

      const participation = {};
      groupMembers.forEach((memberId) => {
        participation[memberId] = memberId === userSplitWiseId.toString();
      });

      return {
        ...item,
        price: cleanedPrice,
        participation,
      };
    });

    const data = {
      groupId: group?.id,
      items: sanitizedItems,
      userId: userSplitWiseId,
      userName: userName,
      description: description,
    };
    const expenses = new ExpenseModel(data);
    await expenses.save();
    res.status(201).json({
      message: "Expense created successfully",
      expenseId: expenses._id,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create expense", details: err.message });
  }
});

router.post("/update-preferences/:expenseId", async (req, res) => {
  const { expenseId } = req.params;
  const { items } = req.body;

  try {
    const expense = await ExpenseModel.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    expense.items = items;
    await expense.save();

    res.json({ message: "Preferences updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update preferences", details: err.message });
  }
});

router.post("/finalize/:expenseId", async (req, res) => {
  const { expenseId } = req.params;
  const access_token = req.user.access_token;

  try {
    const expense = await ExpenseModel.findById(expenseId);
    if (!expense)
      return res.status(404).json({ success: false, message: "Not found" });

    if (String(req.user.user_details.user.id) !== String(expense.userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { totalCost, userShares } = computeUserShares(
      expense.items,
      expense.userId
    );
    const participantCount = Object.keys(userShares).length;
    if (
      participantCount === 1 &&
      Object.keys(userShares)[0] === expense.userId
    ) {
      return res.json({
        success: true,
        message: "Only creator is participant. No need to post to Splitwise.",
      });
    }

    const result = await postToSplitwise(
      expense.groupId,
      "Finalized Shared Expense",
      totalCost,
      userShares,
      expense.userId,
      access_token
    );

    if (result.errors.length > 0) {
      return res.status(500).json({
        success: false,
        message: "Splitwise API error",
        errors: result.errors,
      });
    }

    expense.status = "settled";
    await expense.save();

    res.json({
      success: true,
      message: "Finalized on Splitwise",
      splitwiseExpense: result,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to finalize expense", details: err.message });
  }
});

router.post("/delete/:expenseId", async (req, res) => {
  const { expenseId } = req.params;
  const userId = req.user.user_details.user.id;
  try {
    const expense = await ExpenseModel.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    if (String(userId) !== String(expense.userId)) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this expense" });
    }

    await ExpenseModel.deleteOne({ _id: expenseId });
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete expense", details: err.message });
  }
});

module.exports = router;
