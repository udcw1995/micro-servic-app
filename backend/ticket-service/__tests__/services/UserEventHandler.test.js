'use strict';

jest.mock('../../services/rabbitmq', () => ({
  getChannel: jest.fn(),
}));

jest.mock('../../repositories/user/UserRepository', () => ({
  upsert: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
}));

const { getChannel } = require('../../services/rabbitmq');
const userRepository = require('../../repositories/user/UserRepository');
const { startListening } = require('../../services/UserEventHandler');

const QUEUE = 'user_service_events';

describe('UserEventHandler', () => {
  let channel;
  let consumeCallback;

  beforeEach(() => {
    jest.clearAllMocks();

    channel = {
      assertQueue: jest.fn().mockResolvedValue(undefined),
      prefetch: jest.fn(),
      ack: jest.fn(),
      consume: jest.fn().mockImplementation((_queue, cb) => {
        consumeCallback = cb;
      }),
    };

    getChannel.mockReturnValue(channel);
  });

  async function send(action, payload) {
    const msg = { content: Buffer.from(JSON.stringify({ action, payload })) };
    await consumeCallback(msg);
    return msg;
  }

  describe('startListening()', () => {
    test('asserts the queue, sets prefetch and registers a consumer', async () => {
      await startListening();

      expect(channel.assertQueue).toHaveBeenCalledWith(QUEUE, { durable: true });
      expect(channel.prefetch).toHaveBeenCalledWith(1);
      expect(channel.consume).toHaveBeenCalledWith(QUEUE, expect.any(Function));
    });

    test('does nothing and does not ack when msg is null', async () => {
      await startListening();
      await consumeCallback(null);

      expect(userRepository.upsert).not.toHaveBeenCalled();
      expect(userRepository.delete).not.toHaveBeenCalled();
      expect(channel.ack).not.toHaveBeenCalled();
    });
  });

  describe('USER_CREATED event', () => {
    test('calls userRepository.upsert with the full payload', async () => {
      await startListening();

      const payload = { id: 'u1', firstName: 'Alice', email: 'alice@example.com', roleName: 'developer' };
      const msg = await send('USER_CREATED', payload);

      expect(userRepository.upsert).toHaveBeenCalledWith(payload);
      expect(channel.ack).toHaveBeenCalledWith(msg);
    });
  });

  describe('USER_UPDATED event', () => {
    test('calls userRepository.upsert with the updated payload', async () => {
      await startListening();

      const payload = { id: 'u1', firstName: 'Alice', email: 'alice@new.com', roleName: 'admin' };
      const msg = await send('USER_UPDATED', payload);

      expect(userRepository.upsert).toHaveBeenCalledWith(payload);
      expect(channel.ack).toHaveBeenCalledWith(msg);
    });
  });

  describe('USER_DELETED event', () => {
    test('calls userRepository.delete and acks when the user exists', async () => {
      userRepository.delete.mockResolvedValue(true);
      await startListening();

      const msg = await send('USER_DELETED', { userId: 'u1' });

      expect(userRepository.delete).toHaveBeenCalledWith('u1');
      expect(channel.ack).toHaveBeenCalledWith(msg);
    });

    test('logs a warning but still acks when user is not found', async () => {
      userRepository.delete.mockResolvedValue(false);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      await startListening();

      const msg = await send('USER_DELETED', { userId: 'unknown-id' });

      expect(userRepository.delete).toHaveBeenCalledWith('unknown-id');
      expect(warnSpy).toHaveBeenCalled();
      expect(channel.ack).toHaveBeenCalledWith(msg);
      warnSpy.mockRestore();
    });
  });

  describe('unknown action', () => {
    test('logs a warning, does not call any repository method, and still acks', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      await startListening();

      const msg = await send('UNKNOWN_ACTION', {});

      expect(userRepository.upsert).not.toHaveBeenCalled();
      expect(userRepository.delete).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      expect(channel.ack).toHaveBeenCalledWith(msg);
      warnSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    test('acks the message even when the event handler throws', async () => {
      userRepository.upsert.mockRejectedValue(new Error('DB failure'));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await startListening();

      const msg = await send('USER_CREATED', { id: 'u1', email: 'x@y.com' });

      expect(channel.ack).toHaveBeenCalledWith(msg);
      errorSpy.mockRestore();
    });

    test('acks when JSON parsing fails', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await startListening();

      const msg = { content: Buffer.from('not valid json') };
      await consumeCallback(msg);

      expect(channel.ack).toHaveBeenCalledWith(msg);
      errorSpy.mockRestore();
    });
  });
});
