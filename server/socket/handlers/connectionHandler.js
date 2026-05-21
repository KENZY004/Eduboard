// ← NEW FILE | Issue #59 | Centralized Socket Event Manager
const EVENTS = require('../events');
const Board = require('../../models/Board');
const { roomUsers } = require('../state');

const registerConnectionHandlers = (io, socket) => {
    socket.on(EVENTS.BOARD_JOIN, async (roomId, userData) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`, userData);

        if (userData && userData.userId) {
            if (!roomUsers.has(roomId)) {
                roomUsers.set(roomId, new Map());
            }
            roomUsers.get(roomId).set(userData.userId, {
                userId: userData.userId,
                username: userData.username,
                socketId: socket.id,
                role: userData.role
            });

            const users = Array.from(roomUsers.get(roomId).values());
            io.to(roomId).emit(EVENTS.ROOM_USERS_UPDATED, users);

            try {
                await Board.findOneAndUpdate(
                    { roomId },
                    { $addToSet: { participants: { userId: userData.userId, role: userData.role, joinedAt: new Date() } } },
                    { upsert: false }
                );
            } catch (err) {
                console.error('Error adding participant:', err);
            }
        }

        try {
            let board = await Board.findOne({ roomId })
                .populate('allowedStudents', 'username email')
                .populate('createdBy', 'username');

            if (board) {
                socket.emit(EVENTS.BOARD_LOAD, {
                    elements: board.elements,
                    allowedStudents: board.allowedStudents || [],
                    boardName: board.name,
                    teacherName: board.createdBy?.username || 'Unknown Teacher'
                });
            } else {
                socket.emit(EVENTS.BOARD_LOAD, {
                    elements: [],
                    allowedStudents: [],
                    boardName: 'Untitled Board',
                    teacherName: 'Unknown Teacher'
                });
            }
        } catch (err) {
            console.error('Error loading board:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        roomUsers.forEach((users, roomId) => {
            for (const [userId, userData] of users.entries()) {
                if (userData.socketId === socket.id) {
                    users.delete(userId);
                    io.to(roomId).emit(EVENTS.ROOM_USERS_UPDATED, Array.from(users.values()));
                    break;
                }
            }
        });
    });
};

module.exports = { registerConnectionHandlers };
