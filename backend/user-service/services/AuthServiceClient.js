'use strict';

const { getChannel } = require('./rabbitmq');

const AUTH_SERVICE_EVENTS_QUEUE = 'auth_service_events';

async function notifyUserDeleted(userId) {
  const channel = getChannel();
  await channel.assertQueue(AUTH_SERVICE_EVENTS_QUEUE, { durable: true });
  channel.sendToQueue(
    AUTH_SERVICE_EVENTS_QUEUE,
    Buffer.from(JSON.stringify({ action: 'USER_DELETED', payload: { userId } })),
    { persistent: true }
  );
}

module.exports = { notifyUserDeleted };
