// eslint-disable-next-line no-unused-vars
const { CommandInteraction, MessageEmbed } = require('discord.js');
const Command = require('../structures/command');

class Help extends Command {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'help',
      description: 'List of all commands',
      permissions: ['EMBED_LINKS'],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const embed = new MessageEmbed()
      .setFooter({
        text: `Dev・${(await this.client.users.fetch('838620835282812969')).tag}`,
        iconURL: (await this.client.users.fetch('838620835282812969')).avatarURL(),
      })
      .setTitle(`Commands List:`)
      .setColor(interaction.guild?.me?.displayHexColor)
      .setThumbnail(this.client.user.avatarURL());

    this.client.commands.forEach(command => {
      embed.addField(
        `・\`/${command.name}\``,

        `> ${command.description}` +
          `${
            command.options && command.options.length
              ? `\n> Subcommands: \`${command.options
                  .filter(c => c.type < 3)
                  .map(c => c.name)
                  .join('`, `')}\``
              : ``
          }`,
        false,
      );
    });

    return interaction.reply({
      embeds: [embed],
    });

    // leaving it up to you!
  }
}

module.exports = Help;
