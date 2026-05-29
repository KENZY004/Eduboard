const Client = require('socket.io-client');
const jwt = require('jsonwebtoken');

let activeClients = [];
let serverUrl;
let serverInstance;
let socketServerInstance;

const startServer = () => {
    return new Promise((resolve) => {
        // Set test env to prevent server from listening automatically
        process.env.NODE_ENV = 'test';
        
        // Mock mongoose before requiring app
        const { server, io } = require('../../index');
        serverInstance = server;
        socketServerInstance = io;

        serverInstance.listen(0, () => {
            const port = serverInstance.address().port;
            serverUrl = `http://localhost:${port}`;
            resolve(serverUrl);
        });
    });
};

const createClient = (url, userId = 'user1', role = 'student') => {
    return new Promise((resolve, reject) => {
        const secret = process.env.JWT_SECRET || 'supersecretkey';
        const token = jwt.sign({ id: userId, role }, secret);
        const client = new Client(url, { auth: { token } });
        
        client.on("connect", () => {
            activeClients.push(client);
            resolve(client);
        });

        client.on("connect_error", (err) => {
            reject(err);
        });
    });
};

const stopServer = () => {
    activeClients.forEach(c => c.disconnect());
    activeClients = [];
    if (socketServerInstance) {
        socketServerInstance.close();
    }
    if (serverInstance) {
        serverInstance.close();
    }
};

module.exports = {
    startServer,
    createClient,
    stopServer
};
