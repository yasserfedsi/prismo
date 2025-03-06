const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "ban",
  description: "Ban a user",
  devOnly: false,
  testOnly: false,
  deleted: false,
  options: [
    {
      name: "target",
      description: "The user to ban",
      type: 6, // USER type
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the ban",
      type: 3, // STRING type
      required: false,
    },
  ],
  callback: async (client, interaction) => {
    await interaction.deferReply();

    // Check if command is used in a server
    if (!interaction.guild) {
      return interaction.editReply(
        "This command can only be used in a server."
      );
    }

    // Check if the user executing the command has the BAN_MEMBERS permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.editReply(
        "You do not have permission to ban members."
      );
    }

    const targetUser = interaction.options.getUser("target");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    try {
      await interaction.guild.bans.create(targetUser.id, { reason });
      interaction.editReply(
        `${targetUser.toString()} has been banned. Reason: ${reason}`
      );
    } catch (error) {
      console.error(error);
      interaction.editReply(
        `Failed to ban ${targetUser.toString()}. Check bot permissions and role hierarchy.`
      );
    }
  },
};
