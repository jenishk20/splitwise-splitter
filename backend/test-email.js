const axios = require("axios");

const SERVER_URL = "http://localhost:5003";
const TEST_EMAIL = "kotharijenish2001@gmail.com";

async function testEmailConfiguration() {
  try {
    console.log("🔍 Checking email service configuration...");

    const configResponse = await axios.get(`${SERVER_URL}/email-test/config`);
    console.log("✅ Configuration check:", configResponse.data);

    if (!configResponse.data.hasResendApiKey) {
      console.log("❌ RESEND_API_KEY is not set in environment variables");
      console.log("Please add RESEND_API_KEY to your .env file");
      return;
    }

    console.log("✅ RESEND_API_KEY is configured");
  } catch (error) {
    console.error("❌ Configuration check failed:", error.message);
  }
}

async function testSendEmail() {
  try {
    console.log(`📧 Sending Meta offer revoked email to ${TEST_EMAIL}...`);

    const response = await axios.post(`${SERVER_URL}/email-test/test`, {
      testEmail: TEST_EMAIL,
    });

    console.log("✅ Meta offer revoked email sent successfully! 😈");
    console.log("Response:", response.data);
  } catch (error) {
    console.error(
      "❌ Failed to send Meta offer revoked email:",
      error.response?.data || error.message
    );
  }
}

async function runTests() {
  console.log("🚀 Starting email functionality tests...\n");

  await testEmailConfiguration();
  console.log(""); // Empty line for readability

  // Only proceed with email test if user has updated the email address
  if (TEST_EMAIL === "your-gmail@gmail.com") {
    console.log(
      "⚠️  Please update TEST_EMAIL in this script with your Gmail address"
    );
    return;
  }

  await testSendEmail();

  console.log("\n📋 Next steps:");
  console.log(
    "1. Check your friend's Gmail inbox for the Meta offer revoked email"
  );
  console.log("2. Check spam folder if they don't see it in inbox");
  console.log("3. The email will be sent from noreply@jenishkothari.me");
}

runTests();
