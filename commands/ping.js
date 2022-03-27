const Command = require('../structures/command');

class Ping extends Command {
  constructor(client, options) {
    super(client, {
      ...options,
      name: 'ping',
      description: 'Ping of this Bot',
    });
  }

  run(interaction) {
    interaction
      .reply({
        content: `Pong! \`${this.client.ws.ping}\` ms.`,
      })
      .catch(() => {});
  }
}

module.exports = Ping;
