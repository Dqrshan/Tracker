/* eslint-disable no-unused-vars */
const chalk = require('chalk');
const Client = require('../structures/client');
const { register } = require('../assets/register');

/**
 * @param {Client} client
 */
module.exports = async client => {
  client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: '/help',
        type: 'WATCHING',
      },
    ],
  });
  console.log(chalk.greenBright(`[@] ${client.user.tag}`));
  // await client.application?.commands?.set([]); // clear slash commands
  // await client.db.user.raw.drop();
  await client.db.user.init();
  const guild = client.guilds.cache.get('865126895690842112');
  await register(client, guild);
};
