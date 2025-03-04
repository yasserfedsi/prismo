const { Client, Interaction, EmbedBuilder } = require("discord.js");
const Level = require("../../models/levelSchema");
require("dotenv").config();

module.exports = {
  name: "top",
  description: "Displays the top-ranked users in the server.",
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
      // Fetch all users' levels
      let allLevels = await Level.find({
        guildId: interaction.guild.id,
      }).select("userId level xp");

      // Fetch all members in the guild
      const allMembers = await interaction.guild.members.fetch();

      // Add all members (even those without levels)
      allMembers.forEach((member) => {
        if (!allLevels.some((lvl) => lvl.userId === member.id)) {
          allLevels.push({ userId: member.id, level: 0, xp: 0 });
        }
      });

      // Remove users with the excluded role (stored in .env)
      const excludedRoleId = process.env.EXCLUDED_ROLE_ID;
      if (excludedRoleId) {
        allLevels = allLevels.filter((lvl) => {
          const member = interaction.guild.members.cache.get(lvl.userId);
          return member && !member.roles.cache.has(excludedRoleId);
        });
      }

      // Sort leaderboard by level and XP
      allLevels.sort((a, b) =>
        a.level === b.level ? b.xp - a.xp : b.level - a.level
      );

      // Take the top 10 members
      const topUsers = allLevels.slice(0, 10);

      // Generate leaderboard text
      let leaderboardText = topUsers
        .map((lvl, index) => {
          const member = interaction.guild.members.cache.get(lvl.userId);
          return `**${index + 1}.** ${
            member ? member.user.tag : "Unknown User"
          } - XP: **${lvl.xp}**`;
        })
        .join("\n");

      if (!leaderboardText) leaderboardText = "No users have been ranked yet.";

      // Create Embed
      const embed = new EmbedBuilder()
        .setTitle("🏆 Server Leaderboard")
        .setColor("#0099ff")
        .setDescription(leaderboardText)
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Send Embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      await interaction.editReply(
        "An error occurred while fetching the leaderboard."
      );
    }
  },
};
