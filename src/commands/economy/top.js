const { Client, Interaction, EmbedBuilder } = require("discord.js");
const Level = require("../../models/level.model");
require("dotenv").config();

module.exports = {
  name: "top",
  description: "Shows the server's top-ranked members.",
  devOnly: false,
  testOnly: false,
  deleted: false,

  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();

    try {
      // Fetch all levels from DB
      let allLevels = await Level.find({
        guildId: interaction.guild.id,
      }).select("userId level xp");

      // Fetch all members to ensure we include users with no XP
      const allMembers = await interaction.guild.members.fetch();

      allMembers.forEach((member) => {
        if (!allLevels.some((lvl) => lvl.userId === member.id)) {
          allLevels.push({ userId: member.id, level: 0, xp: 0 });
        }
      });

      // Sort members by level and XP
      allLevels.sort((a, b) =>
        a.level === b.level ? b.xp - a.xp : b.level - a.level
      );

      // Exclude bot accounts and users with the excluded role
      const excludedRoleId = process.env.EXCLUDED_ROLE_ID;
      allLevels = allLevels.filter((lvl) => {
        const member = interaction.guild.members.cache.get(lvl.userId);
        return (
          member &&
          !member.user.bot &&
          (!excludedRoleId || !member.roles.cache.has(excludedRoleId))
        );
      });

      // Generate leaderboard text
      const topUsers = allLevels.slice(0, 10); // Show only the top 10 users
      let leaderboardText = topUsers
        .map((lvl, index) => {
          const member = interaction.guild.members.cache.get(lvl.userId);
          return `**#${index + 1}** ${
            member ? member.toString() : "Unknown User"
          } **XP:** \`${lvl.xp}\` **Level:** \`${lvl.level}\``;
        })
        .join("\n");

      if (leaderboardText.length === 0)
        leaderboardText = "No leaderboard data available.";

      // Create Embed
      const embed = new EmbedBuilder()
        .setTitle("🏆 Server Leaderboard")
        .setColor("#FFD700")
        .setDescription(leaderboardText)
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      await interaction.editReply(
        "❌ An error occurred while fetching the leaderboard."
      );
    }
  },
};
