/* eslint-disable no-undef */
const Discord = require('discord.js');
const fs = require('fs');
const { Sequelize } = require('sequelize');
const chalk = require('chalk');
const Command = require('./command');
const User = require('../models/user.model');
const Guild = require('../models/guild.model');

class Client extends Discord.Client {
  constructor() {
    super({
      intents: 32767,
      partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER'],
      failIfNotExists: false,
    });
    this.commands = new Discord.Collection();
    this.sequel = new Sequelize({
      logging: false,
      dialect: 'sqlite',
      storage: '.data/data.sqlite',
    });
    this.db = {
      user: new User(this),
      guild: new Guild(this),
    };
  }

  init(token) {
    if (!token) throw new Error(chalk.redBright('[X] Missing Token'));
    this.login(token);
    this.load();
  }

  load() {
    const files = fs.readdirSync('commands').filter(f => f.endsWith('.js'));
    files.forEach(file => {
      const _c = require(`${process.cwd()}/commands/${file}`);
      if (!(_c.prototype instanceof Command)) {
        throw new Error(chalk.redBright(`[!] "${_c.name}" is not a Command`));
      }
      const cmd = new _c();
      cmd.client = this;
      this.commands.set(cmd.name, cmd);
    });
    console.log(chalk.blueBright(`[$] Loaded "${this.commands.size}" commands`));

    let x = 0;
    const events = fs.readdirSync('events').filter(f => f.endsWith('.js'));
    events.forEach(file => {
      const event = require(`${process.cwd()}/events/${file}`);
      const name = file.split('.')[0];

      this.on(name, event.bind(null, this));
      x++;
    });
    console.log(chalk.blueBright(`[$] Loaded "${x}" events`));
  }
}

module.exports = Client;
