'use strict';

require('dotenv').config();

const express = require('express');
const { sequelize } = require('./config/database');
const { connect: connectRabbitMQ } = require('./config/rabbitmq');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('Auth service database connected and synced');

  await connectRabbitMQ();

  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start auth service:', err);
  process.exit(1);
});
