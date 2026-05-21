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
                    resolve({
                        elements: [],
                        name: 'Mocked Board',
                        createdBy: { username: 'teacher' } 
                    });
                }
            }),
            findOneAndUpdate: jest.fn().mockResolvedValue(true),
        })
    };
});

const { startServer, createClient, stopServer } = require('../utils/socketTestClient');

describe('Socket.IO Room Behavior', () => {
    let serverUrl;
    let client1, client2;

    beforeAll(async () => {
        serverUrl = await startServer();
    });

    afterAll(() => {
        stopServer();
        jest.clearAllMocks();
    });

    beforeEach(async () => {
        client1 = await createClient(serverUrl, 'user1', 'teacher');
        client2 = await createClient(serverUrl, 'user2', 'student');
    });

    afterEach(() => {
        client1.disconnect();
        client2.disconnect();
    });

    test('users should join room and receive board load event', (done) => {
        const roomId = 'room-123';
        
        client1.on('load-board', (data) => {
            expect(data.boardName).toBe('Mocked Board');
            done();
        });

        client1.emit('join-room', roomId, { userId: 'user1', role: 'teacher' });
    });
});
