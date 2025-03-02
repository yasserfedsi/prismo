const { ActivityType } = require("discord.js");

module.exports = (client) => {
  console.log(`${client.user.tag} is online.`);

  let status = [
    {
      name: "Celec Members",
      type: ActivityType.Watching,
    },
  ];

  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 10000);
};
