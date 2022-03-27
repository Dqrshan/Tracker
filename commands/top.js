const { Collection, MessageEmbed } = require('discord.js');
const Command = require('../structures/command');

class Top extends Command {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'top',
      description: 'Messages Leaderboard of top 10 members',
    });
  }

  async run(interaction) {
    const fullData = await this.client.db.user.raw.findAll();
    const collection = new Collection();
    for (let f of fullData) {
      collection.set(f.user, f.messages);
    }

    const lb = collection.sort((x, y) => y.messages - x.messages).first(10);

    const embed = new MessageEmbed()
      .setThumbnail(interaction.guild?.iconURL({ dynamic: true }))
      .setTitle(`Top ${lb.length} Members' Messages`)
      .setDescription(
        `${lb.map((x, i) => {
          return `\`${top(i)}\`. <@!${x.user}>・**${x.messages}** messages`;
        })}`,
      )
      .setColor(interaction.guild?.me?.displayHexColor)
      .setFooter({
        text: `Dev・${(await this.client.users.fetch('838620835282812969')).tag}`,
        iconURL: (await this.client.users.fetch('838620835282812969')).avatarURL(),
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

module.exports = Top;
