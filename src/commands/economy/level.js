const {
  Client,
  Interaction,
  EmbedBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");
const calculateLevelXp = require("../../utils/calculateLevelXp");
const Level = require("../../models/levelSchema");

module.exports = {
  name: "level",
  description: "Shows your/someone's level.",
  devOnly: false,
  testOnly: false,
  deleted: false,

  options: [
    {
      name: "target",
      description: "The user whose level you want to see.",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],

  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();

    const mentionedUserId = interaction.options.get("target")?.value;
    const targetUserId = mentionedUserId || interaction.user.id;

    try {
      const targetUserObj = await interaction.guild.members.fetch(targetUserId);
      const fetchedLevel = await Level.findOne({
        userId: targetUserId,
        guildId: interaction.guild.id,
      });

      if (!fetchedLevel) {
        await interaction.editReply(
          mentionedUserId
            ? `**${targetUserObj.user.tag}** doesn't have any levels yet. Try again when they chat a little more.`
            : "**You don't have any levels yet.** Chat a little more and try again."
        );
        return;
      }

      // Fetch all users and include those without levels
      let allLevels = await Level.find({
        guildId: interaction.guild.id,
      }).select("userId level xp");

      const allMembers = await interaction.guild.members.fetch();
      allMembers.forEach((member) => {
        if (!allLevels.some((lvl) => lvl.userId === member.id)) {
          allLevels.push({ userId: member.id, level: 0, xp: 0 });
        }
      });

      // Sort by level and XP
      allLevels.sort((a, b) =>
        a.level === b.level ? b.xp - a.xp : b.level - a.level
      );

      // Get user's rank
      const currentRank =
        allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

      // **Creating the Embed**
      const embed = new EmbedBuilder()
        .setTitle(`📊 Level Info - ${targetUserObj.user.username}`)
        .setColor("#0099ff")
        .setThumbnail(targetUserObj.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `🏆 **Rank:** #${currentRank}\n\n` +
            `📈 **Level:** ${fetchedLevel.level}\n\n` +
            `⭐ **XP:** ${fetchedLevel.xp} / ${calculateLevelXp(
              fetchedLevel.level
            )} \n\n`
        )
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching user level:", error);
      await interaction.editReply(
        "❌ An error occurred while fetching the level."
      );
    }
  },
};
