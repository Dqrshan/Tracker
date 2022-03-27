/* eslint-disable no-unused-vars */
const { CommandInteraction, MessageEmbed } = require('discord.js');
const Command = require('../structures/command');

class Leaderboard extends Command {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'leaderboard',
      description: 'View the top 10 Members with most messages',
      permissions: ['EMBED_LINKS'],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const fullData = await this.client.db.user.raw.findAll({ order: [['messages', 'DESC']], limit: 10 });
    const data = this.client.db.user.get(interaction.user.id) ?? 0;
    const index = fullData.findIndex(u => u.user === interaction.user.id) + 1;

    const embed = new MessageEmbed()
      .setThumbnail(interaction.guild?.iconURL({ dynamic: true }))
      .setTitle(`Leaderboard (${fullData.length} entries)`)
      .setDescription(
        `${fullData
          .map((x, i) => {
            return `\`${top(i + 1)}\`. <@!${x.user}>・**${x.messages}** messages`;
          })
          .join('\n')}`,
      )
      .setColor(interaction.guild?.me?.displayHexColor)
      .setFooter({
        text: `🏆 Position・${data === 0 ? `unknown` : index}`,
      });

    return interaction
      .reply({
        embeds: [embed],
      })
      .catch(() => {});

    function top(index) {
      return index === 1 ? '🥇' : index === 2 ? '🥈' : index === 3 ? '🥉' : index < 10 ? String(`0${index}`) : index;
    }
  }
}

module.exports = Leaderboard;
