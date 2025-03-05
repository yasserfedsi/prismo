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
  deleted: false,

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser("target");
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const member = interaction.guild.members.resolve(targetUser.id);

    if (!member) {
      return interaction.editReply("User not found in this server.");
    }

    if (!member.bannable) {
      return interaction.editReply(
        "I cannot ban this user. They may have a higher role or special permissions."
      );
    }

    try {
      await member.ban({ reason });
      interaction.editReply(
        `${targetUser.tag} has been banned. Reason: ${reason}`
      );
    } catch (error) {
      console.error(error);
      interaction.editReply("An error occurred while trying to ban the user.");
    }
  },
};
