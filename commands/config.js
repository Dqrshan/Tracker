/* eslint-disable no-unused-vars */
const { CommandInteraction } = require('discord.js');
const Command = require('../structures/command');

class Config extends Command {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'config',
      description: 'Messages Configuration',
      options: [
        {
          name: 'messages',
          description: 'Add/Remove/Reset Messages',
          options: [
            {
              name: 'add',
              description: 'Add messages to a user',
              options: [
                {
                  name: 'target',
                  description: 'Mention the User',
                  required: true,
                  type: Command.prototype.types().USER,
                },
                {
                  name: 'amount',
                  description: 'Amount of messages to add',
                  required: true,
                  type: Command.prototype.types().INTEGER,
                },
              ],
              type: Command.prototype.types().SUB_COMMAND,
            },
            {
              name: 'remove',
              description: 'Remove messages from a user',
              options: [
                {
                  name: 'target',
                  description: 'Mention the User',
                  required: true,
                  type: Command.prototype.types().USER,
                },
                {
                  name: 'amount',
                  description: 'Amount of messages to add',
                  required: true,
                  type: Command.prototype.types().INTEGER,
                },
              ],
              type: Command.prototype.types().SUB_COMMAND,
            },
            {
              name: 'reset',
              description: "Reset all/user's messages",
              options: [
                {
                  name: 'user',
                  description: 'Mention the User or ignore for resetting all messages',
                  required: false,
                  type: Command.prototype.types().USER,
                },
              ],
            },
          ],
          type: Command.prototype.types().SUB_COMMAND_GROUP,
        },
        {
          name: 'auto-refresh-leaderboard',
          description: 'Auto refresh Leaderboard Configuration',
          // soon™️
        },
      ],
      permissions: ['ADMINISTRATOR'],
    });
  }
  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const group = interaction.options.getSubcommandGroup(['messages']);
    const sub = interaction.options.getSubcommand(['add', 'remove', 'reset']);
    const target = interaction.options.getMember('target');
    const amount = interaction.options.getInteger('amount');
    const toReset = interaction.options.getMember('user');

    if (group === 'messages') {
      if (sub === 'add') {
        const data = this.client.db.user.get(target.user.id) ?? 0;
        await this.client.db.user.set(target.user.id, data + amount);
        return interaction.reply({
          content:
            `Added \`${amount}\` messages to **${target.user.tag}**.` +
            `> Total Messages: \`${this.client.db.user.get(target.user.id)}\``,
        });
      } else if (sub === 'remove') {
        const data = this.client.db.user.get(target.user.id) ?? 0;
        await this.client.db.user.set(target.user.id, data - amount);
        return interaction.reply({
          content:
            `Removed \`${amount}\` messages from **${target.user.tag}**.` +
            `> Total Messages: \`${this.client.db.user.get(target.user.id)}\``,
        });
      } else if (sub === 'reset') {
        if (!toReset) {
          const full = await this.client.db.user.raw.findAll();
          for (let f of full) {
            await this.client.db.user.del(f.user);
          }
          return interaction.reply({
            content: `Successfully reset all messages`,
          });
        } else {
          await this.client.db.user.del(toReset.user.id);
          return interaction.reply({
            content: `Successfully reset messages of **${toReset.user.tag}**`,
          });
        }
      }
    }
  }
}

module.exports = Config;
