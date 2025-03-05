const { Client, Message } = require("discord.js");
const activeMember = require("../../models/activeMember.model");
const activeChannel = require("../../models/activeChannel.model");

/**
 * @param {Client} client
 * @param {Message} message
 */

module.exports = async (client, message) => {
  if (!message.inGuild() || message.author.bot) return;

  const { author, guild, channel } = message;

  try {
    await activeMember.findOneAndUpdate(
      {
        userId: author.id,
        guildId: guild.id,
      },
      { $inc: { messageCount: 1 } },
      { upsert: true, new: true }
    );

    await activeChannel.findOneAndUpdate(
      { channelId: channel.id, guildId: guild.id },
      { $inc: { messageCount: 1 } },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error tracking messages: ", error);
  }
};
