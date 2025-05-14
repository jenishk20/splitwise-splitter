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
    <p>Go to SplitMate to opt in/out or finalize it.</p>
  `;

  try {
    await resend.emails.send({
      from: "jenishk1800@gmail.com",
      to: recipientEmails,
      subject: `🧾 New Expense in Group: ${group.name}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
};
