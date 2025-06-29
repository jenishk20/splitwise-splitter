const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("node:fs");
const axios = require("axios");
const ExpenseModel = require("../../models/expense");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const InvoiceJobModel = require("../../models/invoicejob");

const upload = multer({ dest: "uploads/" });

router.post("/parse-invoice", upload.single("invoice"), async (req, res) => {
  try {
    const { groupId } = req.body;
    const userSplitWiseId = req?.user?.user_details?.user?.id;

    const jobId = uuidv4();
    const fileExtension = req.file.mimetype.split("/")[1] || "jpg";
    const key = `uploads/${jobId}.${fileExtension}`;
    const lambdaResponse = await axios.post(
      process.env.FILE_UPLOAD_LAMBDA_URL,
      {
        fileType: fileExtension,
        key: key,
        jobId,
      }
    );

    const { uploadUrl } = lambdaResponse.data;
    const fileBuffer = fs.readFileSync(req.file.path);
    try {
      await axios.put(uploadUrl, fileBuffer, {
        headers: {
          "Content-Type": req.file.mimetype,
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Upload Error", details: err.message });
    }
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
    console.log("Error:", err);
    res.status(500).json({ error: "Upload Error", details: err.message });
  }
});

module.exports = router;
