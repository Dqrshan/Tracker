const chalk = require('chalk');
// eslint-disable-next-line no-unused-vars
const { CommandInteraction } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Client = require('../structures/client');

/**
 * @param {Client} client
 * @param {CommandInteraction} interaction
 */
module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      interaction
        .reply({
          content: 'Invalid Application Command',
          ephemeral: true,
        })
        .catch(() => {});
      return;
    }

    try {
      if (command.permissions) {
        if (typeof command.permissions === 'string') {
          command.permissions = [command.permissions];
        }
        if (
          // eslint-disable-next-line max-len
          !interaction.member.permissions.has(command.permissions)
          && !interaction.guild?.me?.permissions.has(command.permissions)
        ) {
          interaction.reply({
            content: `Missing \`${command.permissions.join('`, `')}\` Permissions`,
            ephemeral: true,
          });
        }
      }
      await command.run(interaction);
    } catch (error) {
      console.log(chalk.redBright(error));
    }
  }
};
