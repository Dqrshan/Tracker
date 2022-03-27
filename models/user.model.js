/* eslint-disable no-unused-vars */
const chalk = require('chalk');
const { Collection } = require('discord.js');
const { DataTypes } = require('sequelize');
const Client = require('../structures/client');

class User {
  /**
   * @param {Client} client
   */
  constructor(client) {
    this.client = client;
  }

  async init() {
    const db = this.client.sequel.define('user', {
      user: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      messages: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    });

    this.raw = db;
    this.data = new Collection();
    await this.raw.sync();

    const full = await this.raw.findAll();
    for (let f of full) {
      this.data.set(f.user, f.messages);
    }
    console.log(chalk.blueBright(`[<>] Database "User" Loaded (${this.data.size} entries)`));
  }

  async set(key, value) {
    value = parseInt(value);
    this.data.set(key, value);
    await this.raw.upsert({
      user: key,
      messages: value,
    });
  }

  async del(key) {
    if (!key) return;
    if (!this.data.has(key)) return;
    this.data.delete(key);
    await this.raw.destroy({
      where: {
        user: key,
      },
    });
  }

  get(key) {
    if (!key) return;
    return this.data.get(key) ?? 0;
  }
}

module.exports = User;
