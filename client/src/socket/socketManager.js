// ← NEW FILE | Issue #59 | Centralized Socket Event Manager
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';

let socketInstance = null;

export const connect = (token, url) => {
    if (!socketInstance) {
        socketInstance = io(url, {
            auth: { token },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
    }
    return socketInstance;
};

export const disconnect = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};

export const useSocket = () => {
    const [socket, setSocket] = useState(socketInstance);

    useEffect(() => {
        // Just syncs the ref to React state to trigger render if needed
        setSocket(socketInstance);
    }, []);

    return socket;
};
