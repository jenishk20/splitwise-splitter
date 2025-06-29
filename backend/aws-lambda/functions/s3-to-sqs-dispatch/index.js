const AWS = require("aws-sdk");
const sqs = new AWS.SQS();
const QUEUE_URL = process.env.QUEUE_URL;

exports.handler = async (event) => {
  try {
    const records = event.Records || [];

    for (const record of records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

      const jobIdWithExt = key.split("/")[1];
      const jobId = jobIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension

      const payload = {
        jobId,
        bucket,
        key,
        timestamp: Date.now(),
      };

      await sqs
        .sendMessage({
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify(payload),
        })
        .promise();
    }

    return { statusCode: 200, body: "Messages sent to SQS" };
  } catch (err) {
    console.error("S3-to-SQS Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
