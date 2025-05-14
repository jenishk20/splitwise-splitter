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
    fs.unlinkSync(req.file.path);

    const command = new AnalyzeDocumentCommand({
      Document: {
        Bytes: fileBytes,
      },
      FeatureTypes: ["FORMS", "TABLES"],
    });
    const textractResponse = await textract.send(command);

    const lines = textractResponse.Blocks.filter(
      (b) => b.BlockType === "LINE"
    ).map((b) => b.Text);

    const result = await generateTextractData(lines);

    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (e) {
      res.status(400).json({ error: "Failed to parse JSON", raw: result });
    }
  } catch (err) {
    res.status(500).json({ error: "Parsing Error", details: err.message });
  }
});

module.exports = router;
