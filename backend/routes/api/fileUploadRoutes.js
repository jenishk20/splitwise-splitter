const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
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
    const fileBytes = fs.readFileSync(req.file.path);
    const jobId = uuidv4();
    console.log("Job ID:", jobId);
    console.log("File Path:", req.file.path);
    await uploadToS3(req.file.path, jobId);
    console.log("Uploaded to S3");
    fs.unlinkSync(req.file.path);

    
    // const command = new AnalyzeDocumentCommand({
    //   Document: {
    //     Bytes: fileBytes,
    //   },
    //   FeatureTypes: ["FORMS", "TABLES"],
    // });
    // const textractResponse = await textract.send(command);

    // const lines = textractResponse.Blocks.filter(
    //   (b) => b.BlockType === "LINE"
    // ).map((b) => b.Text);

    // const result = await generateTextractData(lines);

    // try {
    //   const parsed = JSON.parse(result);
    //   res.json(parsed);
    // } catch (e) {
    //   res.status(400).json({ error: "Failed to parse JSON", raw: result });
    // }
  } catch (err) {
    res.status(500).json({ error: "Parsing Error", details: err.message });
  }
});

module.exports = router;
