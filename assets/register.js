/* eslint-disable no-unused-vars */
const chalk = require('chalk');
const Client = require('../structures/client');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Guild } = require('discord.js');

/**
 * @param {Client} client
 * @param {Guild} guild
 */
async function register(client, guild) {
  let counter = 0;
  let commands = [];
  const commandsFiles = fs.readdirSync(`commands`).filter(x => x.endsWith('.js'));
  for (const commandFile of commandsFiles) {
    let command = require(`../commands/${commandFile}`);
    command = new command();
    command.client = client;
    commands.push({
      name: command.name,
      description: command.description,
      defaultPermission: true,
      options: command.options ?? [],
    });

    counter++;
  }
  // eslint-disable-next-line no-undef
  const rest = new REST({ version: '9' }).setToken(client.token);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }

  console.log(chalk.yellowBright(`[+] Published ${counter} commands`));
}

module.exports = {
  register,
};
