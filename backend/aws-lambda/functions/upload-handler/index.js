const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const sqs = new AWS.SQS();
const BUCKET_NAME = process.env.S3_BUCKET;
const QUEUE_URL = process.env.QUEUE_URL;

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { fileType = "jpg", jobId, key } = body;
    const url = s3.getSignedUrl("putObject", {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: 300,
      ContentType: `image/${fileType}`,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: url, key, jobId }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate upload URL" }),
    };
  }
};
