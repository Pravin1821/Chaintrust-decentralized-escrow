const User = require("../Model/User");

const LEVELS = [
  { min: 100, level: "Elite" },
  { min: 51, level: "Trusted" },
  { min: 21, level: "Rising" },
  { min: 0, level: "New" },
];

function calculateLevel(score = 0) {
  const s = Math.max(0, Number(score) || 0);
  const found = LEVELS.find((entry) => s >= entry.min);
  return found ? found.level : "New";
}

async function updateReputation(userId, points = 0) {
  if (!userId || isNaN(points)) return null;
  const user = await User.findById(userId);
  if (!user) return null;

  const currentScore = Number(user.reputation?.score ?? 0) || 0;
  const nextScore = Math.max(0, currentScore + Number(points));
  user.reputation = {
    score: nextScore,
    level: calculateLevel(nextScore),
  };
  await user.save();
  return user;
}

module.exports = {
  updateReputation,
  calculateLevel,
};
