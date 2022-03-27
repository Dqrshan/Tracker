/* eslint-disable no-unused-vars */
const chalk = require('chalk');
const Client = require('../structures/client');
const { register } = require('../assets/register');
const { CronJob } = require('cron');
const { MessageEmbed, Collection, MessageButton, MessageActionRow } = require('discord.js');

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
  // await client.application?.commands?.set([]); // clear slash commands
  // await client.db.user.raw.drop();
  await client.db.user.init();
  await client.db.guild.init();
  const guild = client.guilds.cache.get('865126895690842112');
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

            const full = await client.db.user.raw.findAll();
            const collection = new Collection();

            for (let d of full) {
              collection.set(d.user, {
                user: d.user,
                messages: d.messages,
              });
            }

            const lb = collection.sort((x, y) => y.messages - x.messages).first(10);

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
                `${lb
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
