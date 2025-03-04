const { Schema, model } = require("mongoose");

const activeMemberSchema = new Schema({
  userId: {
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

module.exports = model("ActiveMember", activeMemberSchema);
