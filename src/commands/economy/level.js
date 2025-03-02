const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require("discord.js");
const { createCanvas, loadImage } = require("canvas"); // ✅ Native Canvas API
const calculateLevelXp = require("../../utils/calculateLevelXp");
const Level = require("../../models/levelSchema");

module.exports = {
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

    const mentionedUserId = interaction.options.get("target-user")?.value;
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

      let allLevels = await Level.find({
        guildId: interaction.guild.id,
      }).select("-_id userId level xp");

      allLevels.sort((a, b) =>
        a.level === b.level ? b.xp - a.xp : b.level - a.level
      );

      let currentRank =
        allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

      // ✅ Create Canvas and Set Size
      const canvas = createCanvas(800, 250);
      const ctx = canvas.getContext("2d");

      // ✅ Load Background Image (Optional: You can replace it with a solid color)
      const background = await loadImage(
        "https://img.freepik.com/photos-gratuite/toile-fond-texturee-solide-beton-peint_53876-110679.jpg?t=st=1740932082~exp=1740935682~hmac=c995cd127d0b213b1732f982ca0caedf2e717166cc6efc8fe93d333f0b44cd49&w=1380"
      );
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // ✅ Draw Username and Rank
      ctx.fillStyle = "#fff";
      ctx.font = "bold 30px Arial";
      ctx.fillText(targetUserObj.user.username, 250, 80);
      ctx.fillText(`Rank #${currentRank}`, 600, 50);

      // ✅ Draw Level and XP
      ctx.font = "20px Arial";
      ctx.fillText(`Level: ${fetchedLevel.level}`, 250, 120);
      ctx.fillText(
        `XP: ${fetchedLevel.xp}/${calculateLevelXp(fetchedLevel.level)}`,
        250,
        150
      );

      // ✅ Draw Progress Bar
      const progressBarWidth = 400;
      const progress = fetchedLevel.xp / calculateLevelXp(fetchedLevel.level);
      ctx.fillStyle = "#555";
      ctx.fillRect(250, 170, progressBarWidth, 20);
      ctx.fillStyle = "#FFD700"; // Gold color
      ctx.fillRect(250, 170, progressBarWidth * progress, 20);

      // ✅ Draw User Avatar
      const avatar = await loadImage(
        targetUserObj.user.displayAvatarURL({ format: "png", size: 128 })
      );
      ctx.beginPath();
      ctx.arc(100, 125, 75, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 25, 50, 150, 150);

      // ✅ Convert Canvas to Image Buffer
      const attachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: "rank.png",
      });

      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error("Error fetching user level:", error);
      await interaction.editReply(
        "An error occurred while fetching the level."
      );
    }
  },

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
};
