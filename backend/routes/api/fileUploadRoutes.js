const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const {
  TextractClient,
  AnalyzeDocumentCommand,
} = require("@aws-sdk/client-textract");

const upload = multer({ dest: "uploads/" });
const textract = new TextractClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY, // ← from IAM
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

router.post("/parse-invoice", upload.single("invoice"), async (req, res) => {
  const fileBytes = fs.readFileSync(req.file.path);
  fs.unlinkSync(req.file.path);

  const command = new AnalyzeDocumentCommand({
    Document: {
      Bytes: fileBytes,
    },
    FeatureTypes: ["FORMS", "TABLES"],
  });

  try {
    const textractResponse = await textract.send(command);

    const lines = textractResponse.Blocks.filter(
      (b) => b.BlockType === "LINE"
    ).map((b) => b.Text);

    console.log("\n📃 Extracted lines from Textract:\n", lines);

    // Use Ollama LLM to convert text to structured JSON
    const prompt = `
    You are a JSON-only grocery receipt parser.
    
    From the receipt text below, extract each purchased item as an object with:
    - item (string)
    - quantity (integer)
    - price (string with $)
    
    📌 IMPORTANT INSTRUCTIONS:
    - DO NOT include explanation or intro text.
    - DO NOT wrap the output in triple backticks (no markdown).
    - DO NOT include comments or code samples.
    - ONLY return a valid JSON array.
    
    Here is the receipt:
    
    ${lines.join("\n")}
    
    Respond only with:
    [
      { "item": "Item Name", "quantity": 1, "price": "$X.XX" },
      ...
    ]
    `;

    const llmResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        prompt,
        stream: false,
      }
    );

    const result = llmResponse.data.response.trim();

    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (e) {
      res.status(400).json({ error: "Failed to parse JSON", raw: result });
    }
  } catch (err) {
    console.error("❌ Textract error:", err.message);
    res.status(500).json({ error: "Textract failed", details: err.message });
  }
});

module.exports = router;
