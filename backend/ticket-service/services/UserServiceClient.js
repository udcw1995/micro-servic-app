'use strict';

const { v4: uuidv4 } = require('uuid');
const { getChannel } = require('./rabbitmq');
const userRepository = require('../repositories/user/UserRepository');

const USER_SERVICE_RPC_QUEUE = 'user_service_rpc';
const RPC_TIMEOUT_MS = 10000;

/**
 * Provides access to user data from the local read-model,
 * which is kept in sync with user-service via RabbitMQ events.
 */
async function getUserById(userId) {
  return userRepository.findById(userId);
}

async function getAllUsers() {
  return userRepository.findAll();
}

/**
 * Fetches all users directly from user-service via RPC.
 * Used on startup to populate the local read-model with users
 * that existed before this service first connected.
 */
function getAllFromUserService() {
  return new Promise(async (resolve, reject) => {
    const channel = getChannel();
    const correlationId = uuidv4();

    const { queue: replyQueue } = await channel.assertQueue('', {
      exclusive: true,
      autoDelete: true,
    });

    const timer = setTimeout(() => {
      reject(new Error('User-service RPC timed out for GET_ALL'));
    }, RPC_TIMEOUT_MS);

    channel.consume(
      replyQueue,
      (msg) => {
        if (!msg || msg.properties.correlationId !== correlationId) return;
        clearTimeout(timer);
        const { data, error, statusCode } = JSON.parse(msg.content.toString());
        if (error) {
          const err = new Error(error);
          err.statusCode = statusCode || 500;
          return reject(err);
        }
        resolve(data);
      },
      { noAck: true }
    );

    channel.sendToQueue(
      USER_SERVICE_RPC_QUEUE,
      Buffer.from(JSON.stringify({ action: 'GET_ALL', payload: {} })),
      { correlationId, replyTo: replyQueue, persistent: true }
    );
  });
}

module.exports = { getUserById, getAllUsers, getAllFromUserService };
