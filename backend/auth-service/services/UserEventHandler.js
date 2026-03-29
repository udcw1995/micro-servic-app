'use strict';

const { getChannel } = require('../config/rabbitmq');
const credentialRepository = require('../services/CredentialRepository');

const AUTH_SERVICE_EVENTS_QUEUE = 'auth_service_events';

const handlers = {
  async USER_DELETED({ userId }) {
    const deleted = await credentialRepository.delete(userId);
    if (deleted) {
      console.log(`Credentials deleted for user ${userId}`);
    } else {
      console.warn(`No credentials found for user ${userId} — nothing to delete`);
    }
  },
};

async function startListening() {
  const channel = getChannel();
  await channel.assertQueue(AUTH_SERVICE_EVENTS_QUEUE, { durable: true });
  channel.prefetch(1);

  channel.consume(AUTH_SERVICE_EVENTS_QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const { action, payload } = JSON.parse(msg.content.toString());
      const handler = handlers[action];
      if (handler) {
        await handler(payload);
      } else {
        console.warn(`Unknown event action: ${action}`);
      }
    } catch (err) {
      console.error('Error processing auth service event:', err.message);
    } finally {
      channel.ack(msg);
    }
  });

  console.log(`Auth service listening on RabbitMQ queue: ${AUTH_SERVICE_EVENTS_QUEUE}`);
}

module.exports = { startListening };
