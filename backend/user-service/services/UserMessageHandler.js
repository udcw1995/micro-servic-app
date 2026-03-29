'use strict';

const { getChannel } = require('./rabbitmq');
const userRepository = require('./UserRepository');

const USER_SERVICE_QUEUE = 'user_service_rpc';

const handlers = {
  async FIND_BY_EMAIL({ email }) {
    return userRepository.findByEmail(email);
  },
  async FIND_BY_ID({ id }) {
    return userRepository.findById(id);
  },
  async CREATE(userData) {
    return userRepository.create(userData);
  },
};

async function startListening() {
  const channel = getChannel();
  await channel.assertQueue(USER_SERVICE_QUEUE, { durable: true });
  channel.prefetch(1);

  channel.consume(USER_SERVICE_QUEUE, async (msg) => {
    if (!msg) return;

    let response;
    try {
      const { action, payload } = JSON.parse(msg.content.toString());
      const handler = handlers[action];
      if (!handler) {
        response = { error: `Unknown action: ${action}`, statusCode: 400 };
      } else {
        const data = await handler(payload);
        response = { data };
      }
    } catch (err) {
      response = { error: err.message, statusCode: err.statusCode || 500 };
    }

    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(JSON.stringify(response)),
      { correlationId: msg.properties.correlationId }
    );
    channel.ack(msg);
  });

  console.log(`User service listening on RabbitMQ queue: ${USER_SERVICE_QUEUE}`);
}

module.exports = { startListening };
