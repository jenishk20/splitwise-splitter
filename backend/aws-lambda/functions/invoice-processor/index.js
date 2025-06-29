const AWS = require("aws-sdk");
const { MongoClient } = require("mongodb");
const { SecretsManager } = AWS;
const s3 = new AWS.S3();

const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });
const secretsManager = new SecretsManager({ region: "us-east-2" });
async function getSecrets(secretName) {
  const data = await secretsManager
    .getSecretValue({ SecretId: secretName })
    .promise();
  return JSON.parse(data.SecretString);
}

async function getImageFromS3(bucket, key) {
  const obj = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  return obj.Body.toString("base64");
}

exports.handler = async (event) => {
  let client, connection;
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
  const jobIdWithExt = key.split("/")[1]; // e.g. "ddc62b44-6605-4cd1-8c99-8aa3d6ee2838.jpg"
  const jobId = jobIdWithExt.replace(/\.[^/.]+$/, ""); // remove file extension
  try {
    const secret = await getSecrets("splitMate-keys");
    const imageBase64 = await getImageFromS3(bucket, key);

    client = new MongoClient(secret.MONGODB_URL);
    connection = await client.connect();
    const db = client.db("splitwise");

    const collection = db.collection("invoicejobs");

    await collection.updateOne({ jobId }, { $set: { status: "AI analyzing" } });
    // Claude prompt for image parsing
    const prompt = [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `You are a JSON-only grocery receipt parser.

From the image of the receipt, extract each purchased item as an object with:
- item (string, default to empty string if missing)
- quantity (integer, default to 1)
- price (string in $ format, default to "$0.00")

⚠️ Only return a valid JSON array like:
[
  { "item": "Milk", "quantity": 2, "price": "$3.00" },
  ...
]`,
          },
        ],
      },
    ];

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: prompt, // ✅ wrap the message properly
    };
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const claudeRes = await bedrockClient.send(command);
    const parsed = JSON.parse(Buffer.from(claudeRes.body).toString("utf-8"));
    const parsedResult = parsed.content[0].text;
    console.log("Parsed Result:", parsedResult);
    await collection.updateOne(
      { jobId },
      { $set: { status: "Done", parsedResult } }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ jobId, parsedResult }),
    };
  } catch (err) {
    console.error("Invoice Error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    if (connection) connection.close();
  }
};
