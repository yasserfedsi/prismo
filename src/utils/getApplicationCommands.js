module.exports = async (client, guildId) => {
  let applicationCommands;

  try {
    if (guildId) {
      console.log(`Fetching commands for Guild ID: ${guildId}`);
      const guild = await client.guilds.fetch(guildId).catch((err) => {
        console.error(`❌ Error fetching guild: ${err.message}`);
        return null;
      });

      if (!guild) {
        console.error(
          `❌ Bot is not in the guild (ID: ${guildId}) or lacks permissions.`
        );
        return null;
      }

      applicationCommands = guild.commands;
    } else {
      console.log("ℹ️ Fetching global application commands...");

      if (!client.application) {
        console.error("❌ client.application is not available.");
        return null;
      }

      await client.application.fetch(); // Ensure application is ready
      applicationCommands = client.application.commands;
    }

    if (!applicationCommands) {
      console.error(`❌ Could not retrieve application commands.`);
      return null;
    }

    await applicationCommands.fetch().catch((err) => {
      console.error(`❌ Error fetching commands: ${err.message}`);
      return null;
    });

    console.log("✅ Successfully fetched application commands.");
    return applicationCommands;
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
    return null;
  }
};
