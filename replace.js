const fs = require('fs');
let code = fs.readFileSync('client/src/components/Whiteboard.jsx', 'utf8');

const map = {
    'join-room': 'BOARD_JOIN',
    'load-board': 'BOARD_LOAD',
    'board-deleted': 'BOARD_DELETED',
    'drawing-stroke': 'DRAWING_STROKE',
    'draw-element': 'DRAW_ELEMENT',
    'delete-element': 'DELETE_ELEMENT',
    'update-element': 'UPDATE_ELEMENT',
    'sync-elements': 'SYNC_ELEMENTS',
    'sync-state': 'SYNC_STATE',
    'clear-canvas': 'CLEAR_CANVAS',
    'change-theme': 'CHANGE_THEME',
    'theme-changed': 'THEME_CHANGED',
    'viewport-change': 'VIEWPORT_CHANGE',
    'cursor-move': 'CURSOR_MOVE',
    'room-users-updated': 'ROOM_USERS_UPDATED',
    'grant-student-permission': 'GRANT_PERMISSION',
    'revoke-student-permission': 'REVOKE_PERMISSION',
    'editing-permission-changed': 'PERMISSION_CHANGED',
    'toggle-student-editing': 'TOGGLE_EDITING',
    'student-editing-changed': 'EDITING_CHANGED'
};

for (const [str, ev] of Object.entries(map)) {
    const regex1 = new RegExp(`socket\\.on\\('${str}'`, 'g');
    code = code.replace(regex1, `socket.on(EVENTS.${ev}`);
    
    const regex2 = new RegExp(`socket\\.emit\\('${str}'`, 'g');
    code = code.replace(regex2, `socket.emit(EVENTS.${ev}`);
    
    const regex3 = new RegExp(`socket\\.off\\('${str}'`, 'g');
    code = code.replace(regex3, `socket.off(EVENTS.${ev}`);

    const regex4 = new RegExp(`newSocket\\.emit\\('${str}'`, 'g');
    code = code.replace(regex4, `newSocket.emit(EVENTS.${ev}`);
}

code = code.replace(
    `import { motion, AnimatePresence } from 'framer-motion';`, 
    `import { motion, AnimatePresence } from 'framer-motion';\nimport { EVENTS } from '../socket/events';\nimport { useSocket, connect, disconnect } from '../socket/socketManager'; // ← REFACTORED`
);

code = code.replace(
    `const [socket, setSocket] = useState(null);`, 
    `const socket = useSocket(); // ← REFACTORED`
);

const searchBlock = `        const token = localStorage.getItem('token');
        const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
            auth: {
                token: token // Add JWT token for Socket.IO authentication
            }
        });
        setSocket(newSocket);`;

const replaceBlock = `        // ← REFACTORED
        const token = localStorage.getItem('token');
        const newSocket = connect(token, import.meta.env.VITE_API_BASE_URL);`;

code = code.replace(searchBlock, replaceBlock);

code = code.replace(`import { io } from 'socket.io-client';\n`, '');

fs.writeFileSync('client/src/components/Whiteboard.jsx', code);
console.log('Replacements complete');
