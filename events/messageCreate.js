/* eslint-disable no-unused-vars */
const { Message } = require('discord.js');
const Client = require('../structures/client');

/**
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;

  let data = await client.db.user.raw.findOne({
    where: {
      guild: message.guildId,
      user: message.author.id,
    },
  });
  let msgs = data !== null ? parseInt(data.messages) : 0;
  if (!message.content) return;
  await client.db.user.raw.upsert({
    guild: message.guildId,
    user: message.author.id,
    messages: msgs + 1,
  });
};
