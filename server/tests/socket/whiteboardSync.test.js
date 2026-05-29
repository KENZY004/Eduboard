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
            findOne: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                then: function(resolve) {
                    resolve({ elements: [] });
                }
            }),
            findOneAndUpdate: jest.fn().mockResolvedValue(true),
        })
    };
});

const { startServer, createClient, stopServer } = require('../utils/socketTestClient');

describe('Whiteboard Synchronization', () => {
    let serverUrl, client1, client2;
    const roomId = 'test-room';

    beforeAll(async () => {
        serverUrl = await startServer();
        client1 = await createClient(serverUrl, 'user1');
        client2 = await createClient(serverUrl, 'user2');
        
        client1.emit('join-room', roomId, { userId: 'user1' });
        client2.emit('join-room', roomId, { userId: 'user2' });
        
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterAll(() => {
        stopServer();
        jest.clearAllMocks();
    });

    test('drawing stroke should be broadcast to other room members', (done) => {
        const strokeData = { roomId, x: 10, y: 20 };
        
        client2.on('drawing-stroke', (data) => {
            expect(data.x).toBe(10);
            done();
        });

        client1.emit('drawing-stroke', strokeData);
    });

    test('drawn element should be broadcast', (done) => {
        const element = { roomId, id: 'el1', type: 'rect' };
        
        client2.on('draw-element', (data) => {
            expect(data.id).toBe('el1');
            done();
        });

        client1.emit('draw-element', element);
    });
});
