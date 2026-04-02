/**
 * Debt Optimization Algorithm
 * 
 * Converts raw balances into minimal settlement transactions.
 * 
 * balances format:
 * {
 *   "Alice": -50,
 *   "Bob": 30,
 *   "Charlie": 20
 * }
 * 
 * Negative → owes money
 * Positive → should receive money
 */

function minimizeTransactions(balances) {
  const transactions = [];

  let creditors = [];
  let debtors = [];

  // Separate creditors and debtors
  for (const person in balances) {
    const amount = balances[person];

    if (amount > 0) {
      creditors.push({ name: person, amount });
    } else if (amount < 0) {
      debtors.push({ name: person, amount: -amount });
    }
  }

  // Sort by highest amounts first
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Greedy settlement
  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0];
    const debtor = debtors[0];

    const settlementAmount = Math.min(creditor.amount, debtor.amount);

    transactions.push({
      from: debtor.name,
      to: creditor.name,
      amount: settlementAmount
    });

    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;

    if (creditor.amount === 0) creditors.shift();
    if (debtor.amount === 0) debtors.shift();
  }

  return transactions;
}

module.exports = minimizeTransactions;

