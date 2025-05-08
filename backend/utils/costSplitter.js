const computeUserShares = (items, payerId) => {
  const userTotals = {};
  let total = 0;

  items.forEach((item) => {
    const price = parseFloat(item.price || 0);
    total += price;

    const participationObj =
      item.participation instanceof Map
        ? Object.fromEntries(item.participation)
        : item.participation;

    const participants = Object.entries(participationObj)
      .filter(([_, optedIn]) => optedIn)
      .map(([userId]) => String(userId));

    const splitAmount = price / participants.length;

    participants.forEach((userId) => {
      userTotals[userId] = (userTotals[userId] || 0) + splitAmount;
    });
  });

  return { totalCost: total, userShares: userTotals };
};

module.exports = { computeUserShares };
