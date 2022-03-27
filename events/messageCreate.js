/* eslint-disable no-unused-vars */
const { Message } = require('discord.js');
const Client = require('../structures/client');

/**
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;

  let data = client.db.user.get(message.author.id);
  data = parseInt(data);
  if (!message.content) return;
  await client.db.user.set(message.author.id, parseInt(data + 1));
};
