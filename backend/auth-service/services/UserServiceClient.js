'use strict';

const { v4: uuidv4 } = require('uuid');
const { getChannel } = require('../config/rabbitmq');

const USER_SERVICE_QUEUE = 'user_service_rpc';
const RPC_TIMEOUT_MS = 10000;

function rpcCall(action, payload) {
  return new Promise(async (resolve, reject) => {
    const channel = getChannel();
    const correlationId = uuidv4();

    // Create an exclusive, auto-delete reply queue for this request
    const { queue: replyQueue } = await channel.assertQueue('', {
      exclusive: true,
      autoDelete: true,
    });

    const timer = setTimeout(() => {
      reject(new Error(`User-service RPC timed out for action: ${action}`));
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
      USER_SERVICE_QUEUE,
      Buffer.from(JSON.stringify({ action, payload })),
      { correlationId, replyTo: replyQueue, persistent: true }
    );
  });
}

const UserServiceClient = {
  findByEmail: (email) => rpcCall('FIND_BY_EMAIL', { email }),
  findById: (id) => rpcCall('FIND_BY_ID', { id }),
  create: (userData) => rpcCall('CREATE', userData),
};

module.exports = UserServiceClient;
