const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const calculateLevelXp = require("../../utils/calculateLevelXp");
const Level = require("../../models/levelSchema");

module.exports = {
  name: "level",
  description: "Shows your/someone's level.",
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
    if (!interaction.guild) {
      await interaction.reply("You can only run this command inside a server.");
      return;
    }

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
            ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
            : "You don't have any levels yet. Chat a little more and try again."
        );
        return;
      }

      // 🔹 Fetch all users' levels
      let allLevels = await Level.find({
        guildId: interaction.guild.id,
      }).select("userId level xp");

      // 🔹 Sort by Level and XP
      allLevels.sort((a, b) =>
        a.level === b.level ? b.xp - a.xp : b.level - a.level
      );

      // 🔹 Find User's Rank
      let currentRank =
        allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

      // 🎨 Create Embed
      const embed = new EmbedBuilder()
        .setTitle(`🏅 Level Info - ${targetUserObj.user.username}`)
        .setColor("#0099ff")
        .setThumbnail(targetUserObj.user.displayAvatarURL({ size: 1024 }))
        .addFields(
          { name: "🔹 Rank", value: `#${currentRank}`, inline: true },
          { name: "📈 Level", value: `${fetchedLevel.level}`, inline: true },
          {
            name: "⚡ XP",
            value: `${fetchedLevel.xp} / ${calculateLevelXp(
              fetchedLevel.level
            )}`,
            inline: true,
          }
        )
        .setFooter({
          text: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      // 🔹 Send Embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching user level:", error);
      await interaction.editReply(
        "An error occurred while fetching the level."
      );
    }
  },
};
