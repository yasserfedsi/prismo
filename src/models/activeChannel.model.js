const { Schema, model } = require("mongoose");

const activeChannelSchema = new Schema({
  channelId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
});

module.exports = model("activeChannel", activeChannelSchema);
