const express = require("express");
const router = express.Router();
const ExpenseModel = require("../../models/expense");
const { route } = require("./fileUploadRoutes");

router.get("/get-expenses/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const expenses = await ExpenseModel.find({ groupId });
    res.json(expenses);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch expenses", details: err.message });
  }
});

router.post("/submit-expense", async (req, res) => {
  const { group, items } = req.body;
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

module.exports = router;
