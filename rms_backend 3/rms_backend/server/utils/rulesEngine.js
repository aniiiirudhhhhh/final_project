function evaluateRules(rules, transaction) {
  let totalPoints = 0;

  rules.forEach(rule => {
    if (rule.ruleType === "category") {
      if (
        transaction.category === rule.if.category &&
        transaction.amount >= rule.if.amount.$gte
      ) {
        totalPoints += (transaction.amount / 100) * rule.then.pointsPer100;
        totalPoints += rule.then.bonusPoints || 0;
      }
    }
    // Add more rule types like tier, thresholds, etc.
  });

  return totalPoints;
}

module.exports = { evaluateRules };