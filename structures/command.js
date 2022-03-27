/* eslint-disable no-tabs */
/* eslint-disable no-unused-vars */
const chalk = require('chalk');
const { ApplicationCommand, CommandInteraction } = require('discord.js');
const Client = require('./client');

const slashcommandoptions = ApplicationCommand.prototype.options;
class Command {
  /**
   * @typedef {Object} CommandOptions
   * @property {string} [name] - name
   * @property {string} [description] - description
   * @property {import("discord.js").PermissionResolvable[]} [permissions=[]] - permissions
   * @property {slashcommandoptions} [options] - options
   * @property {boolean} [ownerOnly=false] - ownerOnly
   */
  /**
   * @param {Client} client
   * @param {CommandOptions} options
   */
  constructor(client, options) {
    this.client = client;

    this.name = options.name;
    this.description = options.description;
    this.options = options.options ?? [];
    this.permissions = options.permissions ?? [];
    this.ownerOnly = options.ownerOnly ?? false;
  }

  /**
   * @abstract
   * @param {CommandInteraction} interaction
   * @returns {Promise<CommandInteraction>}
   */
  async run(interaction) {
    throw new Error(chalk.redBright(`[X] "${this.name}" has no run() method`));
  }

  types() {
    return {
      SUB_COMMAND: 1,
      SUB_COMMAND_GROUP: 2,
      STRING: 3,
      INTEGER: 4,
      BOOLEAN: 5,
      USER: 6,
      CHANNEL: 7,
      ROLE: 8,
      MENTIONABLE: 9,
      NUMBER: 10,
      ATTACHMENT: 11,
    };
  }
}

module.exports = Command;
