const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("node:fs");
const axios = require("axios");
const ExpenseModel = require("../../models/expense");
const { generateTextractData } = require("../../utils/openai");
const {
  TextractClient,
  AnalyzeDocumentCommand,
} = require("@aws-sdk/client-textract");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const uploadToS3 = require("../../services/uploadToS3");
const InvoiceJobModel = require("../../models/invoicejob");

const upload = multer({ dest: "uploads/" });
const textract = new TextractClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

router.post("/parse-invoice", upload.single("invoice"), async (req, res) => {
  try {
    const { groupId } = req.body;
    const userSplitWiseId = req?.user?.user_details?.user?.id;

    const jobId = uuidv4();
    await uploadToS3(req.file.path, jobId);
    fs.unlinkSync(req.file.path);

    const invoiceJobModel = new InvoiceJobModel({
      jobId,
      groupId: groupId,
      userId: userSplitWiseId,
      status: "Uploaded",
    });

    await invoiceJobModel.save();
    res.status(200).json({ message: "Job submitted successfully", jobId });
  } catch (err) {
    res.status(500).json({ error: "Upload Error", details: err.message });
  }
});

router.get("/get-job", async (req, res) => {
  try {
    const { jobId } = req.query;
    const job = await InvoiceJobModel.findOne({ jobId });
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ error: "Get Job Error", details: err.message });
  }
});

module.exports = router;
