'use strict';

const { getChannel } = require('./rabbitmq');

const USER_EVENTS_QUEUE = 'user_service_events';

async function publish(action, payload) {
  const channel = getChannel();
  await channel.assertQueue(USER_EVENTS_QUEUE, { durable: true });
  channel.sendToQueue(
    USER_EVENTS_QUEUE,
    Buffer.from(JSON.stringify({ action, payload })),
    { persistent: true }
  );
}

async function publishUserCreated(user) {
  await publish('USER_CREATED', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roleId: user.roleId ?? null,
    roleName: user.role?.name ?? null,
  });
}

async function publishUserUpdated(user) {
  await publish('USER_UPDATED', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roleId: user.roleId ?? null,
    roleName: user.role?.name ?? null,
  });
}

async function publishUserDeleted(userId) {
  await publish('USER_DELETED', { userId });
}

module.exports = { publishUserCreated, publishUserUpdated, publishUserDeleted };
