import { Resend } from "resend";
import { track } from "../utils/track.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendExpenseNotification = async ({
  group,
  items,
  addedBy,
  expenseId,
}) => {
  const recipientEmails = group.members.map((m) => m.email);
  const itemSummary = items
    .map((item, idx) => `${idx + 1}. ${item.item} — $${item.price}`)
    .join("<br>");

  // Deep link straight to the opt-in page so the recipient is one tap from
  // picking their items — the single biggest fix to the invite loop.
  const appUrl = process.env.FRONTEND_URL || "https://splitmate.app";
  const expenseLink = `${appUrl}/dashboard/group/${group.id}/expenses/${expenseId}`;

  const html = `
    <p>👋 Hello!</p>
    <p><strong>${addedBy}</strong> just added a new expense in the group <strong>${group.name}</strong>.</p>
    <p><strong>Items:</strong><br>${itemSummary}</p>
    <p><strong>⚠️ Important:</strong> Pick the items you're in on, or you'll be split into everything by default.</p>
    <p style="margin:24px 0;">
      <a href="${expenseLink}" style="display:inline-block;padding:12px 22px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-family:sans-serif;">
        Open &amp; pick your items →
      </a>
    </p>
    <p style="font-size:12px;color:#888;">Or paste this link: ${expenseLink}</p>
  `;

  try {
    const results = [];
    const failures = [];

    for (const email of recipientEmails) {
      try {
        const result = await resend.emails.send({
          from:
            process.env.FROM_EMAIL || "SplitMate <noreply@jenishkothari.me>",
          to: [email],
          subject: `🧾 New Expense in Group: ${group.name}`,
          html,
          headers: {
            "X-Priority": "3",
            "X-Mailer": "SplitMate Application",
          },
        });
        results.push({ email, result });
        track("invite_sent", {
          groupId: String(group.id),
          expenseId: expenseId ? String(expenseId) : null,
          email,
        });
        await new Promise((resolve) =>
          setTimeout(resolve, process.env.EMAIL_SEND_DELAY_MS || 100)
        );
      } catch (error) {
        failures.push({ email, error });
      }
    }
    if (failures.length === recipientEmails.length) {
      throw new Error("All emails failed to send");
    }
    return { results, failures };
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};
