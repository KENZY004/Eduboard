// ← NEW
const Client = require('socket.io-client');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

let activeClients = [];
let serverUrl;
let serverInstance;

const startServer = () => {
    return new Promise((resolve) => {
        // Set test env to prevent server from listening automatically
        process.env.NODE_ENV = 'test';
        
        // Mock mongoose before requiring app
        const { server } = require('../../index');
        serverInstance = server;

        serverInstance.listen(0, () => {
            const port = serverInstance.address().port;
            serverUrl = `http://localhost:${port}`;
            resolve(serverUrl);
        });
    });
};

const createClient = (url, userId = 'user1', role = 'student') => {
    return new Promise((resolve, reject) => {
        const token = jwt.sign({ id: userId, role }, JWT_SECRET);
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
    if (serverInstance) {
        serverInstance.close();
    }
};

module.exports = {
    startServer,
    createClient,
    stopServer
};
