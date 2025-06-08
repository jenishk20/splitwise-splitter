const fs = require("fs");
const AWS = require("aws-sdk");
const path = require("path");
const crypto = require("crypto");

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY_ID,
});

const s3 = new AWS.S3();

// Allowed file extensions
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".pdf"]);

// Sanitize the file path and validate extension
const validateAndSanitizePath = (filePath) => {
  // Get the file extension and convert to lowercase
  const ext = path.extname(filePath).toLowerCase();

  // Check if extension is allowed
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(
      "Invalid file type. Only jpg, jpeg, png, and pdf files are allowed."
    );
  }

  // Get the base filename without path
  const baseName = path.basename(filePath);

  // Generate a random filename while preserving extension
  const randomName = crypto.randomBytes(16).toString("hex");
  const sanitizedPath = path.join(
    process.env.UPLOAD_DIR || "uploads",
    `${randomName}${ext}`
  );

  return {
    sanitizedPath,
    extension: ext,
    originalName: baseName,
  };
};

const uploadToS3 = async (localFilePath, jobId) => {
  try {
    // Validate and sanitize the file path
    const { sanitizedPath, extension, originalName } =
      validateAndSanitizePath(localFilePath);

    // Ensure the file exists and is within the allowed directory
    const absolutePath = path.resolve(sanitizedPath);
    if (
      !absolutePath.startsWith(
        path.resolve(process.env.UPLOAD_DIR || "uploads")
      )
    ) {
      throw new Error("Invalid file path");
    }

    const fileContent = fs.readFileSync(localFilePath);
    const s3Key = `invoices/${jobId}-${crypto.randomBytes(8).toString("hex")}${extension}`;

    const params = {
      Bucket: "splitmate-jobs",
      Key: s3Key,
      Body: fileContent,
      ContentType: getMimeType(extension),
      Metadata: {
        "original-name": originalName,
      },
    };

    await s3.putObject(params).promise();
    console.log(`✅ Uploaded to S3 as ${s3Key}`);
  } catch (err) {
    console.error("S3 Upload Error:", err);
    throw new Error(`Failed to upload to S3: ${err.message}`);
  }
};

// Get correct MIME type based on file extension
const getMimeType = (extension) => {
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".pdf": "application/pdf",
  };
  return mimeTypes[extension] || "application/octet-stream";
};

module.exports = uploadToS3;
