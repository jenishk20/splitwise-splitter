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

  const userIds = Object.keys(userTotals);
  const roundedShares = userIds.map((id) =>
    parseFloat(userTotals[id].toFixed(2))
  );

  const roundedTotalOwed = roundedShares.reduce((acc, val) => acc + val, 0);
  const targetTotal = parseFloat(total.toFixed(2));
  const diff = targetTotal - roundedTotalOwed;

  const lastUserId = userIds[userIds.length - 1];
  roundedShares[roundedShares.length - 1] += diff;

  const reconciledUserShares = {};
  userIds.forEach((id, i) => {
    reconciledUserShares[id] = parseFloat(roundedShares[i].toFixed(2));
  });

  return { totalCost: targetTotal, userShares: reconciledUserShares };
};

module.exports = { computeUserShares };
