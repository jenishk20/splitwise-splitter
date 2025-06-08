const fs = require("fs");
const AWS = require("aws-sdk");
const path = require("path");

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY_ID,
});

const s3 = new AWS.S3();

const uploadToS3 = async (localFilePath, jobId) => {
  try {
    const fileContent = fs.readFileSync(localFilePath);
    const ext = path.extname(localFilePath);
    const s3Key = `invoices/${jobId}${ext}`;

    const params = {
      Bucket: "splitmate-jobs",
      Key: s3Key,
      Body: fileContent,
      ContentType: "image/jpeg",
    };

    await s3.putObject(params).promise();
    console.log(`✅ Uploaded to S3 as ${s3Key}`);
  } catch (err) {
    throw new Error(`Failed to upload to S3: ${err.message}`);
  }
};

module.exports = uploadToS3;
