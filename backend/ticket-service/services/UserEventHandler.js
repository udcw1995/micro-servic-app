'use strict';

const { getChannel } = require('./rabbitmq');
const userRepository = require('../repositories/user/UserRepository');

const USER_EVENTS_QUEUE = 'user_service_events';

const handlers = {
  async USER_CREATED(payload) {
    await userRepository.upsert(payload);
    console.log(`Local user created: ${payload.id} (${payload.email})`);
  },

  async USER_UPDATED(payload) {
    await userRepository.upsert(payload);
    console.log(`Local user updated: ${payload.id} (${payload.email})`);
  },

  async USER_DELETED({ userId }) {
    const deleted = await userRepository.delete(userId);
    if (deleted) {
      console.log(`Local user deleted: ${userId}`);
    } else {
      console.warn(`Local user not found for deletion: ${userId}`);
    }
  },
};

async function startListening() {
  const channel = getChannel();
  await channel.assertQueue(USER_EVENTS_QUEUE, { durable: true });
  channel.prefetch(1);

  channel.consume(USER_EVENTS_QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const { action, payload } = JSON.parse(msg.content.toString());
      const handler = handlers[action];
      if (handler) {
        await handler(payload);
      } else {
        console.warn(`Unknown user event action: ${action}`);
      }
    } catch (err) {
      console.error('Error processing user event:', err.message);
    } finally {
      channel.ack(msg);
    }
  });

  console.log(`Ticket service listening on RabbitMQ queue: ${USER_EVENTS_QUEUE}`);
}

module.exports = { startListening };
