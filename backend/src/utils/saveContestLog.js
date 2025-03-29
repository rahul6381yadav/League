const ContestLog = require("../model/ContestLogsModel");

const saveContestLog = async (message) => {
  const newContestLog = new ContestLog({
    type: message.type,
    roomCode: message.roomCode,
    user: {
      name: message.name,
      rollNumber: message.rollNumber,
      leetcodeUsername: message.leetcodeUsername,
    },
    message: message.message,
    url: message.url,
    category: message.category,
    status: message.status || "info",
  });
  await newContestLog.save();
};

module.exports = saveContestLog;
