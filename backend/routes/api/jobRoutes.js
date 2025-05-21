const express = require("express");
const router = express.Router();
const InvoiceJobModel = require("../../models/invoicejob");

router.get("/stream", async (req, res) => {
  const { groupId } = req.query;
  const userSplitWiseId = req?.user?.user_details?.user?.id;
  let isConnectionOpen = true;

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendUpdate = async () => {
    if (!isConnectionOpen) return;

    try {
      // Get active jobs and recently completed/errored jobs (within last 5 seconds)
      const fiveSecondsAgo = new Date(Date.now() - 5000);
      const jobs = await InvoiceJobModel.find({
        groupId,
        userId: userSplitWiseId,
        $or: [
          { status: { $nin: ["Done", "Error"] } },
          {
            status: { $in: ["Done", "Error"] },
            updatedAt: { $gte: fiveSecondsAgo },
          },
        ],
      }).sort({ createdAt: -1 });

      if (jobs.length === 0) {
        if (isConnectionOpen) {
          res.write(`data: ${JSON.stringify({ jobs: [], done: true })}\n\n`);
          isConnectionOpen = false;
          res.end();
        }
        return;
      }

      if (isConnectionOpen) {
        res.write(`data: ${JSON.stringify({ jobs })}\n\n`);
      }
    } catch (error) {
      if (isConnectionOpen) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        isConnectionOpen = false;
        res.end();
      }
    }
  };

  await sendUpdate();

  const intervalId = setInterval(sendUpdate, 2000);

  req.on("close", () => {
    isConnectionOpen = false;
    clearInterval(intervalId);
  });
});

router.get("/", async (req, res) => {
  const { groupId } = req.query;
  const userSplitWiseId = req?.user?.user_details?.user?.id;
  const jobs = await InvoiceJobModel.find({
    groupId,
    userId: userSplitWiseId,
  }).sort({ createdAt: -1 });

  res.json(jobs);
});

router.get("/get-jobs/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const jobs = await InvoiceJobModel.findOne({ groupId });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Get Job Error", details: err.message });
  }
});

module.exports = router;
