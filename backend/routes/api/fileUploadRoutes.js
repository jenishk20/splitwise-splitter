const express = require("express");
const router = express.Router();

router.post("/upload-csv", (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }
  const data = file.buffer.toString("utf-8");
  const rows = data.split("\n").map((row) => row.split(","));
  const headers = rows[0];
  const jsonData = rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  res.send("File uploaded successfully.", jsonData);
});

module.exports = router;
