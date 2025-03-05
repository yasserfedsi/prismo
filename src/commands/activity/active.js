const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const activeMember = require("../../models/activeMember.model");
const activeChannel = require("../../models/activeChannel.model");
require("dotenv").config();

module.exports = {
  name: "active",
  description: "Shows the most active members or channels.",
  devOnly: false,
  testOnly: false,
  deleted: false,
  options: [
    {
      name: "type",
      description: "Choose between members or channels.",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "Members", value: "members" },
        { name: "Channels", value: "channels" },
      ],
    },
  ],

  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();

    const type = interaction.options.getString("type");

    try {
      if (type === "members") {
        let activeMembers = await activeMember.find({
          guildId: interaction.guild.id,
        }).select("userId messageCount");

        const allMembers = await interaction.guild.members.fetch();
        allMembers.forEach((member) => {
          if (!activeMembers.some((m) => m.userId === member.id)) {
            activeMembers.push({ userId: member.id, messageCount: 0 });
          }
        });

        activeMembers.sort((a, b) => b.messageCount - a.messageCount);

        // Exclude users with a specific role
        const excludedRoleId = process.env.EXCLUDED_ROLE_ID;
        if (excludedRoleId) {
          activeMembers = activeMembers.filter(
            (m) =>
              !interaction.guild.members.cache
                .get(m.userId)
                ?.roles.cache.has(excludedRoleId)
          );
        }

        const topMembers = activeMembers.slice(0, 10);
        let leaderboardText = topMembers
          .map((m, index) => {
            const member = interaction.guild.members.cache.get(m.userId);
            return `**#${index + 1}** ${
              member ? member.toString() : "Unknown User"
            } **Messages:** \`${m.messageCount}\``;
          })
          .join("\n");

        if (!leaderboardText) leaderboardText = "No active members found.";

        const embed = new EmbedBuilder()
          .setTitle("🏆 Most Active Members")
          .setColor("#FFD700")
          .setDescription(leaderboardText)
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else if (type === "channels") {
        let activeChannels = await activeChannel.find({
          guildId: interaction.guild.id,
        }).select("channelId messageCount");

        activeChannels.sort((a, b) => b.messageCount - a.messageCount);

        const topChannels = activeChannels.slice(0, 5);
        let leaderboardText = topChannels
          .map((c, index) => {
            const channel = interaction.guild.channels.cache.get(c.channelId);
            return channel
              ? `**#${index + 1}** <#${channel.id}> **Messages:** \`${
                  c.messageCount
                }\``
              : null;
          })
          .filter(Boolean)
          .join("\n");

        if (!leaderboardText) leaderboardText = "No active channels found.";

        // ✅ Identify the highest engagement channel
        let highestEngagementChannel = activeChannels[0];
        let highestEngagementText = "No engagement data available.";

        if (highestEngagementChannel) {
          const channel = interaction.guild.channels.cache.get(
            highestEngagementChannel.channelId
          );
          if (channel) {
            highestEngagementText = `🏅 **Top Engaged Channel:** <#${channel.id}> **with** \`${highestEngagementChannel.messageCount}\` **messages**!`;
          }
        }

        const embed = new EmbedBuilder()
          .setTitle("📢 Most Active Channels")
          .setColor("#1E90FF")
          .setDescription(`${highestEngagementText}\n\n${leaderboardText}`)
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error fetching active members/channels:", error);
      await interaction.editReply(
        "❌ An error occurred while fetching the data."
      );
    }
  },
};
