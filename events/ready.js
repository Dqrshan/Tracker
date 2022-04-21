/* eslint-disable no-unused-vars */
const chalk = require('chalk');
const Client = require('../structures/client');
const { register } = require('../assets/register');
const { CronJob } = require('cron');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

/**
 * @param {Client} client
 */
module.exports = async client => {
  client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: '/help',
        type: 'WATCHING',
      },
    ],
  });
  console.log(chalk.greenBright(`[@] ${client.user.tag}`));

  // load database(s)
  await client.db.user.init();
  await client.db.guild.init();

  // register application commands
  // eslint-disable-next-line no-undef
  const guild = client.guilds.cache.get(process.env.guild);
  await register(client, guild);

  /** Auto - Refresh - Leaderboard */
  /**
   * @see https://cronjob.xyz for time examples
   */
  const job = new CronJob(
    '*/5 * * * *', // every 5 minutes
    async function () {
      client.guilds.cache.forEach(async guild => {
        const data = await client.db.guild.raw.findOne({
          where: {
            guild: guild.id,
          },
        });
        if (!data) return;

        if (data && data.channel) {
          const channel = guild?.channels.cache.get(data.channel);
          if (!channel) return;

          if (data && data.msg) {
            const msg = await channel.messages.fetch(data.msg);
            if (!msg) return;

            const _data = await client.db.user.raw.findAll({ order: [['messages', 'DESC']], limit: 10 });
            const embed = new MessageEmbed()
              .setFooter({
                text: `Next refresh`,
              })
              .setTimestamp(Date.now() + 5 * 60 * 1000) // 5 minutes
              .setTitle('Leaderboard')
              .setThumbnail(
                guild.iconURL({
                  dynamic: true,
                }),
              )
              .setColor(guild?.me?.displayHexColor)
              .setDescription(
                `${_data
                  .map((x, i) => {
                    return `\`${top(i + 1)}\`. <@!${x.user}>・**${x.messages}** messages`;
                  })
                  .join('\n')}`,
              );

            if (msg) {
              await msg.edit({ embeds: [embed] }).catch(() => {});
            } else {
              // check messages button
              const button = new MessageButton().setLabel('Check Messages').setStyle('SECONDARY').setCustomId('_CHECK');
              const m = await channel
                .send({ embeds: [embed], components: [new MessageActionRow().addComponents(button)] })
                .catch(() => {});
              await client.db.guild.raw.upsert({
                guild: guild.id,
                channel: channel.id,
                msg: m.id,
              });
            }
          }
        }
      });
    },
    null,
    true,
    'Asia/Calcutta',
  );

  try {
    job.start();
  } catch (e) {
    console.log(chalk.redBright(`[X] auto-refresh-leaderboard failed to start: ${e}`));
  }

  function top(index) {
    return index === 1 ? '🥇' : index === 2 ? '🥈' : index === 3 ? '🥉' : index < 10 ? String(`0${index}`) : index;
  }
};
