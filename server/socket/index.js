// ← NEW FILE | Issue #59 | Centralized Socket Event Manager
const authSocket = require('./middleware/authSocket');
const loggerSocket = require('./middleware/loggerSocket');
const { registerConnectionHandlers } = require('./handlers/connectionHandler');
const { registerBoardHandlers } = require('./handlers/boardHandler');
const { registerCursorHandlers } = require('./handlers/cursorHandler');

const initSocketManager = (io) => {
    // Middleware
    io.use(authSocket);
    io.use(loggerSocket);

    // Connection Handler
    io.on('connection', (socket) => {
        registerConnectionHandlers(io, socket);
        registerBoardHandlers(io, socket);
        registerCursorHandlers(io, socket);
    });
};

module.exports = { initSocketManager };
