const express = require("express");
const router = express.Router();
const BugModel = require("../../models/bugs");

router.post("/", async (req, res) => {
  const { type, description, reporterName, reporterEmail } = req.body;
  try {
    const bug = new BugModel({
      type,
      description,
      reporterName,
      reporterEmail,
    });
    await bug.save();
    res.status(200).json({ message: "Bug report submitted" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to submit bug report", details: err.message });
  }
});

module.exports = router;
