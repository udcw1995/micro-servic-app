'use strict';

require('dotenv').config();

const express = require('express');
const { sequelize } = require('./config/database');
const { connect: connectRabbitMQ } = require('./services/rabbitmq');
const { startListening } = require('./services/UserMessageHandler');
const userRoutes = require('./routes/user/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/users', userRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await sequelize.authenticate();
  console.log('Database connected');

  await connectRabbitMQ();
  await startListening();

  app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
