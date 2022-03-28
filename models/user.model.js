/* eslint-disable no-unused-vars */
const chalk = require('chalk');
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
      guild: {
        type: DataTypes.STRING,
      },
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
    await this.raw.sync();

    console.log(chalk.blueBright(`[<>] Database "User" Loaded`));
  }
}

module.exports = User;
