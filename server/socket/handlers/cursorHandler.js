// ← NEW FILE | Issue #59 | Centralized Socket Event Manager
const EVENTS = require('../events');

const registerCursorHandlers = (io, socket) => {
    socket.on(EVENTS.CURSOR_MOVE, (data) => {
        socket.to(data.roomId).emit(EVENTS.CURSOR_MOVE, data);
    });
};

module.exports = { registerCursorHandlers };
