'use strict';

require('dotenv').config();

const express = require('express');
const { sequelize } = require('./config/database');
const { connect: connectRabbitMQ } = require('./services/rabbitmq');
const { startListening } = require('./services/UserEventHandler');
const { getAllFromUserService } = require('./services/UserServiceClient');
const userRepository = require('./repositories/user/UserRepository');
const setupAssociations = require('./models/associations');
const teamRoutes = require('./routes/team/teamRoutes');
const instanceRoutes = require('./routes/instance/instanceRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Set up Sequelize model associations before routes are served
setupAssociations();

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/teams', teamRoutes);
app.use('/api/instances', instanceRoutes);

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

  // Populate local user read-model with users that already exist in user-service
  try {
    const users = await getAllFromUserService();
    for (const user of users) {
      await userRepository.upsert(user);
    }
    console.log(`Synced ${users.length} user(s) from user-service`);
  } catch (err) {
    console.warn('Initial user sync failed (non-fatal):', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Ticket service running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
