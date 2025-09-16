import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendExpenseNotification = async ({ group, items, addedBy }) => {
  const recipientEmails = group.members.map((m) => m.email);

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
    const emailResults = [];

    for (const email of recipientEmails) {
      console.log(`📤 Sending individual email to: ${email}`);

      const emailResult = await resend.emails.send({
        from: process.env.FROM_EMAIL || "SplitMate <noreply@jenishkothari.me>",
        to: [email], // Send to one recipient at a time
        subject: `🧾 New Expense in Group: ${group.name}`,
        html,
        headers: {
          "X-Priority": "3",
          "X-Mailer": "SplitMate Application",
        },
      });

      console.log(`✅ Email sent to ${email}:`, emailResult);
      emailResults.push({ email, result: emailResult });

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `📊 Summary: Successfully sent ${emailResults.length} individual emails`
    );
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};
