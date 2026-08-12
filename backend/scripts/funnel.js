// Local funnel report — also your CLI analytics dashboard.
//
// Usage (run from the backend/ folder so dotenv picks up .env):
//   node -r dotenv/config scripts/funnel.js              # show the funnel
//   node -r dotenv/config scripts/funnel.js --selftest   # write a test event first
//
// --selftest proves track() can write to your real DB end-to-end.
const mongoose = require("mongoose");
const EventModel = require("../models/event");

async function main() {
  const url = process.env.MONGODB_URL;
  if (!url) {
    console.error("MONGODB_URL not set. Run with -r dotenv/config from backend/.");
    process.exit(1);
  }
  await mongoose.connect(url);

  if (process.argv.includes("--selftest")) {
    const { track } = require("../utils/track");
    await track("selftest_event", {
      userId: "local-test",
      meta: { at: new Date().toISOString() },
    });
    console.log("✓ wrote a selftest_event to your DB\n");
  }

  const STAGES = [
    "receipt_uploaded",
    "invite_sent",
    "expense_created",
    "optin_completed",
    "expense_finalized",
  ];

  const rows = await EventModel.aggregate([
    { $group: { _id: "$type", n: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(rows.map((r) => [r._id, r.n]));

  console.log("=== SplitMate funnel ===");
  for (const s of STAGES) console.log(s.padEnd(20), counts[s] || 0);

  const others = rows.filter((r) => !STAGES.includes(r._id));
  if (others.length) {
    console.log("--- other events ---");
    others.forEach((r) => console.log(String(r._id).padEnd(20), r.n));
  }

  const invites = counts.invite_sent || 0;
  const optins = counts.optin_completed || 0;
  console.log(
    "\nopt-in rate (optin_completed / invite_sent):",
    invites ? ((100 * optins) / invites).toFixed(1) + "%" : "n/a"
  );

  const uploaders = await EventModel.distinct("userId", {
    type: "receipt_uploaded",
  });
  console.log("distinct uploaders (spreaders):", uploaders.filter(Boolean).length);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
