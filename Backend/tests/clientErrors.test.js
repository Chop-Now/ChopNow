/**
 * The web app reports its own crashes here so real users' problems are visible in the logs.
 */
const request = require('supertest');
const app = require('./app');
const logger = require('../utils/logger');

const post = (body) => request(app).post('/api/v1/client-errors').send(body);

describe('POST /api/v1/client-errors', () => {
  let warn;
  beforeEach(() => {
    warn = jest.spyOn(logger, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  it('accepts a report and logs it, answering 204', async () => {
    const res = await post({
      message: 'Cannot read properties of undefined',
      stack: 'TypeError: x\n at Cart.jsx:10',
      source: 'boundary',
      url: 'https://www.chopnow.app/cart',
    });
    expect(res.status).toBe(204);
    expect(warn).toHaveBeenCalledTimes(1);
    const [fields, text] = warn.mock.calls[0];
    expect(text).toMatch(/Web app error/);
    expect(fields.clientError).toMatchObject({
      message: 'Cannot read properties of undefined',
      source: 'boundary',
      url: 'https://www.chopnow.app/cart',
    });
  });

  it('clips long fields and strips control characters', async () => {
    const res = await post({ message: `a\nb${'x'.repeat(2000)}`, stack: 's'.repeat(10000) });
    expect(res.status).toBe(204);
    const { clientError } = warn.mock.calls[0][0];
    expect(clientError.message.length).toBe(500);
    expect(clientError.message).not.toMatch(/\n/);
    expect(clientError.stack.length).toBe(3000);
  });

  it.each([[{}], [{ message: '' }], [{ message: { $ne: 1 } }], [{ message: 42 }]])(
    'refuses a report without a text message %#',
    async (body) => {
      const res = await post(body);
      expect(res.status).toBe(400);
      expect(warn).not.toHaveBeenCalled();
    }
  );
});
