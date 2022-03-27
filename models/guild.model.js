/* eslint-disable no-unused-vars */
const chalk = require('chalk');
const { DataTypes } = require('sequelize');
const Client = require('../structures/client');

class Guild {
  /**
   * @param {Client} client
   */
  constructor(client) {
    this.client = client;
  }

  async init() {
    const db = this.client.sequel.define('guild', {
      guild: {
        type: DataTypes.STRING,
      },
      channel: {
        type: DataTypes.STRING,
      },
      msg: {
        type: DataTypes.STRING,
      },
    });

    this.raw = db;
    await this.raw.sync();
    console.log(chalk.blueBright(`[<>] Database "Guild" Loaded`));
  }
}

module.exports = Guild;
