'use strict';

const amqplib = require('amqplib');

let connection = null;
let channel = null;

async function connect() {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost';
  connection = await amqplib.connect(url);
  channel = await connection.createChannel();

  connection.on('error', (err) => {
    console.error('RabbitMQ connection error:', err.message);
  });
  connection.on('close', () => {
    console.error('RabbitMQ connection closed');
  });

  console.log('Connected to RabbitMQ');
  return channel;
}

function getChannel() {
  if (!channel) throw new Error('RabbitMQ channel not initialised — call connect() first');
  return channel;
}

module.exports = { connect, getChannel };
