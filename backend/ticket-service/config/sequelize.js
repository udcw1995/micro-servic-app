'use strict';

require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ticket_service_db',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: base,
  test: { ...base, database: process.env.DB_NAME || 'ticket_service_db_test' },
  production: base,
};
