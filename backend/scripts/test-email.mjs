// Send yourself the new invite email so you can see/click the deep-link button.
//
// Usage (run from the backend/ folder; -r dotenv/config loads .env BEFORE the
// Resend client is constructed):
//   node -r dotenv/config scripts/test-email.mjs you@example.com
//
// Note: if your Resend domain isn't verified yet, send to the email on your
// Resend account. This script doesn't write the invite_sent event (no DB
// connection) — that's expected; use funnel.js --selftest to test events.
import { sendExpenseNotification } from "../services/emailService.js";

const to = process.argv[2] || process.env.FROM_EMAIL;
if (!to) {
  console.error("Usage: node -r dotenv/config scripts/test-email.mjs you@example.com");
  process.exit(1);
}

const appUrl = process.env.FRONTEND_URL || "https://splitmate.app";
const group = {
  id: "TEST_GROUP",
  name: "Local Test Group",
  members: [{ id: "1", email: to, first_name: "You" }],
};
const items = [
  { item: "Whole Milk", price: 4.99 },
  { item: "Coffee Beans", price: 12.5 },
];

console.log("FRONTEND_URL  =", process.env.FRONTEND_URL || "(unset → placeholder)");
console.log(
  "Deep link     =",
  `${appUrl}/dashboard/group/TEST_GROUP/expenses/TEST_EXPENSE_123`
);

try {
  const res = await sendExpenseNotification({
    group,
    items,
    addedBy: "Local Test",
    expenseId: "TEST_EXPENSE_123",
  });
  console.log("Resend result:", JSON.stringify(res, null, 2));
  console.log("\n✓ Check your inbox and click 'Open & pick your items →'");
} catch (e) {
  console.error("Send failed:", e.message);
}
process.exit(0);
