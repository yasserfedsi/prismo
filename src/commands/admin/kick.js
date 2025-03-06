const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "kick",
  description: "Kick a user",
  devOnly: false,
  testOnly: false,
  deleted: false,
  options: [
    {
      name: "target",
      description: "The user to kick",
      type: 6, // USER type
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the kick",
      type: 3, // STRING type
      required: false,
    },
  ],
  callback: async (client, interaction) => {
    await interaction.deferReply();

    if (!interaction.guild) {
      return interaction.editReply(
        "This command can only be used in a server."
      );
    }

    // Check if the user executing the command has the KICK_MEMBERS permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.editReply(
        "You do not have permission to kick members."
      );
    }

    const targetUser = interaction.options.getUser("target");
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const member = interaction.guild.members.resolve(targetUser.id);

    if (!member) {
      return interaction.editReply("User not found in this server.");
    }

    try {
      await member.kick(reason);
      interaction.editReply(
        `${targetUser.toString()} has been kicked. Reason: ${reason}`
      );
    } catch (error) {
      console.error(error);
      interaction.editReply(
        `Failed to kick ${targetUser.toString()}. Check bot permissions and role hierarchy.`
      );
    }
  },
};
