/* eslint-disable no-unused-vars */
const { CommandInteraction, Collection, MessageEmbed } = require('discord.js');
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
    const fullData = await this.client.db.user.raw.findAll();
    const collection = new Collection();
    for (let f of fullData) {
      collection.set(f.user, {
        messages: f.messages,
        user: f.user,
      });
    }
    const data = this.client.db.user.get(interaction.user.id) ?? 0;
    const index =
      (await this.client.db.user.raw.findAll())
        .sort((a, b) => b.messages - a.messages)
        .findIndex(m => m.user === interaction.user.id) + 1;

    const lb = collection.sort((x, y) => y.messages - x.messages).first(10);

    const embed = new MessageEmbed()
      .setThumbnail(interaction.guild?.iconURL({ dynamic: true }))
      .setTitle(`Leaderboard (${lb.length} entries)`)
      .setDescription(
        `${lb
          .map((x, i) => {
            return `\`${top(i + 1)}\`. <@!${x.user}>・**${x.messages}** messages`;
          })
          .join('\n')}`,
      )
      .setColor(interaction.guild?.me?.displayHexColor)
      .setFooter({
        text: `🏆 Position・${data === 0 ? `unknown` : index}`,
      });
    // .setFooter({
    //   text: `Dev・${(await this.client.users.fetch('838620835282812969')).tag}`,
    //   iconURL: (await this.client.users.fetch('838620835282812969')).avatarURL(),
    // })

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
