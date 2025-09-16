import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendExpenseNotification = async ({ group, items, addedBy }) => {
  const recipientEmails = group.members.map((m) => m.email);
  console.log(recipientEmails);
  const itemSummary = items
    .map((item, idx) => `${idx + 1}. ${item.item} — $${item.price}`)
    .join("<br>");

  const html = `
    <p>👋 Hello!</p>
    <p><strong>${addedBy}</strong> just added a new expense in the group <strong>${group.name}</strong>.</p>
    <p><strong>Items:</strong><br>${itemSummary}</p>
    <p><strong>⚠️ Important:</strong> Please add your preferences or you will be counted in all items by default.</p>
    <p>Go to SplitMate to opt in/out or finalize it.</p>
  `;

  try {
    const results = [];
    const failures = [];

    for (const email of recipientEmails) {
      try {
        const result = await resend.emails.send(
          {
            from:
              process.env.FROM_EMAIL || "SplitMate <noreply@jenishkothari.me>",
            to: [email],
            subject: `🧾 New Expense in Group: ${group.name}`,
            html,
          },
          {
            headers: {
              "X-Priority": "3",
              "X-Mailer": "SplitMate Application",
            },
          }
        );
        results.push({ email, result });
        await new Promise((resolve) =>
          setTimeout(resolve, process.env.EMAIL_SEND_DELAY_MS || 100)
        );
      } catch (error) {
        failures.push({ email, error });
      }
    }
    console.log(failures);
    if (failures.length === recipientEmails.length) {
      throw new Error("All emails failed to send");
    }
    return { results, failures };
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};
