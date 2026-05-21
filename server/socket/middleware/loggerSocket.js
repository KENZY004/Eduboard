// ← NEW FILE | Issue #59 | Centralized Socket Event Manager

const loggerSocket = (socket, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[SOCKET] connect | id=${socket.id} | user=${socket.userId || 'unknown'}`);
        
        socket.onAny((event, ...args) => {
            console.log(`[SOCKET EVENT] ${event} | user=${socket.userId || 'unknown'}`);
        });
    }
    next();
};

module.exports = loggerSocket;
