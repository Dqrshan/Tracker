/* eslint-disable no-unused-vars */
const { CommandInteraction, MessageEmbed } = require('discord.js');
const Command = require('../structures/command');

class Messages extends Command {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'messages',
      description: 'Check Messages of a User or yourself',
      options: [
        {
          name: 'target',
          description: 'Mention the user to check messages',
          type: Command.prototype.types().USER,
          required: false,
        },
      ],
      permissions: ['EMBED_LINKS'],
    });
  }
  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const member = interaction.options.getMember('target') || interaction.member;
    const data = await this.client.db.user.raw.findOne({
      where: {
        guild: interaction.guildId,
        user: member.user.id,
      },
    });

    let msgs = parseInt(data.messages) ?? 0;
    const index =
      (await this.client.db.user.raw.findAll({ order: [['messages', 'DESC']] })).findIndex(
        m => m.user === member.user.id,
      ) + 1;

    const embed = new MessageEmbed()
      .setTitle(`${member.id === interaction.member.id ? 'Your' : `${member.user.username}'s`} Messages`)
      .setThumbnail(member.displayAvatarURL({ dynamic: true }))
      .setDescription(
        `${member.id === interaction.member.id ? `You have` : `${member.user.username} has`} sent **${msgs}** messages`,
      )
      .setColor(member.displayHexColor)
      .setFooter({
        text: `🏆 Position・${index}`,
      });

    return interaction
      .reply({
        embeds: [embed],
      })
      .catch(() => {});
  }
}

module.exports = Messages;
