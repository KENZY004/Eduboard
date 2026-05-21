// ← NEW
jest.mock('mongoose', () => {
    const mockObjectId = jest.fn();
    return {
        connect: jest.fn().mockResolvedValue(true),
        Schema: Object.assign(
            jest.fn().mockImplementation(() => ({
                index: jest.fn()
            })),
            { Types: { ObjectId: mockObjectId } }
        ),
        model: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue({ elements: [] }),
            findOneAndUpdate: jest.fn().mockResolvedValue(true),
        })
    };
});

const { startServer, createClient, stopServer } = require('../utils/socketTestClient');

describe('Socket.IO Connection Lifecycle', () => {
    let serverUrl;

    beforeAll(async () => {
        serverUrl = await startServer();
    });

    afterAll(() => {
        stopServer();
    });

    test('should connect successfully with valid token', async () => {
        const client = await createClient(serverUrl, 'testUser');
        expect(client.connected).toBe(true);
        client.disconnect();
    });

    test('should reject connection without token', (done) => {
        const Client = require('socket.io-client');
        const client = new Client(serverUrl, { auth: {} });

        client.on('connect_error', (err) => {
            expect(err.message).toBe('Authentication required');
            client.disconnect();
            done();
        });
    });
});
