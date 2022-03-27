/* eslint-disable no-unused-vars */
const { CommandInteraction, MessageEmbed, Collection, MessageButton, MessageActionRow } = require('discord.js');
const Command = require('../structures/command');

class Config extends Command {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'config',
      description: 'Messages Configuration',
      options: [
        // messages sub_command_group
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
              type: Command.prototype.types().SUB_COMMAND,
            },
          ],
          type: Command.prototype.types().SUB_COMMAND_GROUP,
        },
        // auto-refresh-leaderboard sub_commmand_group
        {
          name: 'auto-refresh-leaderboard',
          description: 'Auto refresh Leaderboard Configuration',
          options: [
            {
              name: 'set',
              description: 'Sets auto refresh leaderboard on a channel',
              options: [
                {
                  name: 'channel',
                  description: 'Mention the channel',
                  required: false,
                  type: Command.prototype.types().CHANNEL,
                },
              ],
              type: Command.prototype.types().SUB_COMMAND,
            },
            {
              name: 'reset',
              description: 'Resets auto refresh leaderboard configuration',
              type: Command.prototype.types().SUB_COMMAND,
            },
          ],
          type: Command.prototype.types().SUB_COMMAND_GROUP,
        },
      ],
      permissions: ['ADMINISTRATOR'],
    });
  }
  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const group = interaction.options.getSubcommandGroup(['messages', 'auto-refresh-leaderboard']);
    const sub = interaction.options.getSubcommand(['add', 'remove', 'reset', 'set']);
    const target = interaction.options.getMember('target');
    const amount = interaction.options.getInteger('amount');
    const toReset = interaction.options.getMember('user');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (group === 'messages') {
      if (sub === 'add') {
        const data = this.client.db.user.get(target.user.id) ?? 0;
        await this.client.db.user.set(target.user.id, data + amount);
        return interaction.reply({
          content:
            `Added \`${amount}\` messages to **${target.user.tag}**.\n` +
            `> Total Messages: \`${this.client.db.user.get(target.user.id)}\``,
        });
      } else if (sub === 'remove') {
        const data = this.client.db.user.get(target.user.id) ?? 0;
        if (data < amount) {
          interaction.reply({
            content: `Please specify a valid amount`,
          });
          return;
        }
        await this.client.db.user.set(target.user.id, data - amount);
        return interaction.reply({
          content:
            `Removed \`${amount}\` messages from **${target.user.tag}**.\n` +
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
    } else if (group === 'auto-refresh-leaderboard') {
      if (sub === 'set') {
        if (channel.type !== 'GUILD_TEXT') {
          interaction.reply({
            content: `Channel must be a \`Text Channel\``,
          });
          return;
        }
        const data = await this.client.db.user.raw.findAll();
        const collection = new Collection();

        for (let d of data) {
          collection.set(d.user, {
            user: d.user,
            messages: d.messages,
          });
        }

        const lb = collection.sort((x, y) => y.messages - x.messages).first(10);
        // check messages button
        const button = new MessageButton().setLabel('Check Messages').setStyle('SECONDARY').setCustomId('_CHECK');

        const embed = new MessageEmbed()
          .setFooter({
            text: `Next refresh`,
          })
          .setTimestamp(Date.now() + 5 * 60 * 1000) // 5 minutes
          .setTitle('Leaderboard')
          .setThumbnail(
            interaction.guild.iconURL({
              dynamic: true,
            }),
          )
          .setColor(interaction.guild?.me?.displayHexColor)
          .setDescription(
            `${lb
              .map((x, i) => {
                return `\`${top(i + 1)}\`. <@!${x.user}>・**${x.messages}** messages`;
              })
              .join('\n')}`,
          );

        // delete the older leaderboard (if exists)
        await channel
          .bulkDelete(
            (await channel.messages.fetch()).filter(m => m.author.id === this.client.user.id),
            true,
          )
          .catch(() => {});
        const msg = await channel
          .send({ embeds: [embed], components: [new MessageActionRow().addComponents(button)] })
          .catch(() => {});

        await this.client.db.guild.raw.upsert({
          guild: interaction.guildId,
          channel: channel.id,
          msg: msg.id,
        });

        return interaction.reply({
          content: `Successfully set auto-refresh-leaderboard on ${channel}`,
        });
      } else if (sub === 'reset') {
        const data = await this.client.db.guild.raw.findOne({
          where: {
            guild: interaction.guildId,
          },
        });
        if (!data) {
          interaction.reply({
            content: `There is no auto-refresh-leaderboard setup!`,
          });
          return;
        }

        const ch = this.client.guilds.cache.get(data.guild)?.channels.cache.get(data.channel);
        if (!ch) {
          interaction.reply({
            content: `The auto-refresh-leaderboard was deleted`,
          });
          return;
        }
        const m = await ch.messages.fetch(data.msg);
        if (!m) {
          interaction.reply({
            content: `The auto-refresh-leaderboard was deleted`,
          });
          return;
        }
        if (m) {
          m.delete().catch(() => {});
          await this.client.db.guild.raw.destroy({
            where: {
              guild: interaction.guildId,
            },
          });
        }

        return interaction.reply({
          content: `Successfully reset auto-refresh-leaderboard`,
        });
      }
    }
    function top(index) {
      return index === 1 ? '🥇' : index === 2 ? '🥈' : index === 3 ? '🥉' : index < 10 ? String(`0${index}`) : index;
    }
  }
}

module.exports = Config;
