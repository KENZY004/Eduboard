const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const Board = require('./models/Board');
const SavedBoard = require('./models/SavedBoard');
const User = require('./models/User');
const verifyToken = require('./utils/verifyToken');
const verifyOwnership = require('./utils/verifyOwnership');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev simplicity, restrict in prod
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'Server is running! 🚀',
    message: 'EduBoard API Server',
    endpoints: {
      auth: '/api/auth',
      upload: '/api/upload',
      uploads: '/uploads'
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
const imageRoutes = require('./routes/imageRoutes');
app.use('/api/images', imageRoutes);
const verificationRoutes = require('./routes/verificationRoutes');
app.use('/api/verification', verificationRoutes);
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
const internalRoutes = require('./routes/internalRoutes');
app.use('/api/internal', internalRoutes);

// 🌟 NEW CONTACT ROUTE ADDED HERE 🌟
const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', contactRoutes);

// Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Board Management Endpoints

// Create a new named board (requires authentication)
app.post('/api/boards/create', verifyToken, async (req, res) => {
  try {
    const { name, roomId } = req.body;
    const authUserId = req.user?.id;

    if (!authUserId) {
      return res.status(401).json({ message: 'Invalid authentication state' });
    }

    if (!mongoose.Types.ObjectId.isValid(authUserId)) {
      return res.status(400).json({ message: 'Invalid authenticated user ID' });
    }

    if (!name || !roomId) {
      return res.status(400).json({ message: 'Name and roomId are required' });
    }

    const userExists = await User.exists({ _id: authUserId });
    if (!userExists) {
      return res.status(404).json({ message: 'Authenticated user not found' });
    }

    const newBoard = new Board({
      roomId,
      name,
      createdBy: authUserId,
      elements: [],
      participants: [{
        userId: authUserId,
        role: 'teacher', // Creator is assumed to be teacher
        joinedAt: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newBoard.save();
    res.status(201).json({
      roomId: newBoard.roomId,
      name: newBoard.name,
      createdAt: newBoard.createdAt
    });
  } catch (err) {
    console.error('Error creating board:', err);
    res.status(500).json({ message: 'Failed to create board' });
  }
});

// Get all boards for a specific user (teachers: boards they created) - requires authentication and ownership
app.get('/api/boards/user/:userId', verifyToken, verifyOwnership('userId'), async (req, res) => {
  try {
    const { userId } = req.params;
    // Find boards created by this user (for teachers)
    const boards = await Board.find({
      createdBy: userId
    })
      .populate('createdBy', 'username email')
      .select('roomId name createdBy createdAt updatedAt')
      .sort({ updatedAt: -1 }); // Most recently updated first

    res.json(boards);
  } catch (err) {
    console.error('Error fetching user boards:', err);
    res.status(500).json({ message: 'Failed to fetch boards' });
  }
});

// Get specific board details (requires authentication)
app.get('/api/boards/:roomId', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const board = await Board.findOne({ roomId });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    res.json({
      roomId: board.roomId,
      name: board.name,
      elements: board.elements,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    });
  } catch (err) {
    console.error('Error fetching board:', err);
    res.status(500).json({ message: 'Failed to fetch board' });
  }
});

// Delete a board (requires authentication and ownership)
app.delete('/api/boards/:roomId', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id; // Get userId from JWT token, not query params

    // Find and delete the board only if it belongs to the user
    const result = await Board.findOneAndDelete({
      roomId,
      createdBy: userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Board not found or unauthorized' });
    }

    // Notify all users in the room that the board was deleted
    io.to(roomId).emit('board-deleted', {
      roomId: roomId,
      message: 'This board has been deleted'
    });

    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    console.error('Error deleting board:', err);
    res.status(500).json({ message: 'Failed to delete board' });
  }
});

// Delete a board by MongoDB _id (for orphaned boards) - requires authentication
app.delete('/api/boards/by-id/:boardId', verifyToken, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { force } = req.query;
    const userId = req.user.id; // Get userId from JWT token
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Authenticated user not found' });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isAdmin = user.role === 'admin';
    const isOwner = board.createdBy && board.createdBy.toString() === userId;

    if (force === 'true') {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Forbidden: force delete requires admin privileges' });
      }
    } else if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Forbidden: not authorized to delete this board' });
    }

    const result = await Board.findByIdAndDelete(boardId);

    // Notify all users in the room that the board was deleted
    if (result.roomId) {
      io.to(result.roomId).emit('board-deleted', {
        roomId: result.roomId,
        message: 'This board has been deleted'
      });
    }

    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    console.error('Error deleting board by ID:', err);
    res.status(500).json({ message: 'Failed to delete board' });
  }
});

// Saved Boards Endpoints (for students)

// Save a board (creates independent copy for student) - requires authentication
app.post('/api/boards/save', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from JWT token
    const { roomId, boardName, teacherName, elements } = req.body;

    // Check if already saved
    const existing = await SavedBoard.findOne({ userId, roomId });
    if (existing) {
      return res.status(400).json({ message: 'Board already saved' });
    }

    const savedBoard = new SavedBoard({
      userId,
      roomId,
      boardName,
      teacherName,
      elements,
      savedAt: new Date()
    });

    await savedBoard.save();
    res.status(201).json({ message: 'Board saved successfully', savedBoard });
  } catch (err) {
    console.error('Error saving board:', err);
    res.status(500).json({ message: 'Failed to save board' });
  }
});

// Get all saved boards for a student (requires authentication and ownership)
app.get('/api/boards/saved/:userId', verifyToken, verifyOwnership('userId'), async (req, res) => {
  try {
    const { userId } = req.params;
    const savedBoards = await SavedBoard.find({ userId })
      .sort({ savedAt: -1 });

    res.json(savedBoards);
  } catch (err) {
    console.error('Error fetching saved boards:', err);
    res.status(500).json({ message: 'Failed to fetch saved boards' });
  }
});

// Delete a saved board (student removes from their dashboard) - requires authentication and ownership
app.delete('/api/boards/saved/:savedBoardId', verifyToken, async (req, res) => {
  try {
    const { savedBoardId } = req.params;
    const userId = req.user.id; // Get userId from JWT token

    const result = await SavedBoard.findOneAndDelete({
      _id: savedBoardId,
      userId // Ensure user can only delete their own saved boards
    });

    if (!result) {
      return res.status(404).json({ message: 'Saved board not found' });
    }

    res.json({ message: 'Saved board deleted successfully' });
  } catch (err) {
    console.error('Error deleting saved board:', err);
    res.status(500).json({ message: 'Failed to delete saved board' });
  }
});


// Track connected users per room
const roomUsers = new Map(); // roomId -> Map of userId -> { username, socketId, role }
const waitingRooms = new Map(); // roomId -> Map of socketId -> userData

// Socket.IO Authentication Middleware
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id; // Attach user ID to socket
    next();
  } catch (err) {
    return next(new Error('Invalid token'));
  }
});

// Helper functions for Socket.IO Authorization
const isTeacher = async (roomId, userId) => {
  try {
    const board = await Board.findOne({ roomId });
    return board && board.createdBy.toString() === userId;
  } catch (err) {
    return false;
  }
};

const isAuthorizedToEdit = async (roomId, userId) => {
  try {
    const board = await Board.findOne({ roomId });
    if (!board) return false;
    if (board.createdBy.toString() === userId) return true;
    if (board.allowStudentEditing) return true;
    if (board.allowedStudents && board.allowedStudents.some(id => id.toString() === userId)) return true;
    return false;
  } catch (err) {
    return false;
  }
};

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.userId);

  socket.on('join-room', async (roomId, userData) => {
    console.log(`User ${socket.id} trying to join room ${roomId}`, userData);

    let isHost = false;
    let board = null;
    try {
      board = await Board.findOne({ roomId });
      if (board && userData && board.createdBy.toString() === userData.userId) {
        isHost = true;
      }
    } catch (err) {
      console.error('Error finding board for host check:', err);
    }

    if (userData && !isHost) {
      if (!waitingRooms.has(roomId)) {
        waitingRooms.set(roomId, new Map());
      }
      waitingRooms.get(roomId).set(socket.id, { ...userData, socketId: socket.id, isHost: false });
      
      // Notify host(s) in the room
      socket.to(roomId).emit('participant-waiting', { ...userData, socketId: socket.id, isHost: false });
      
      // Tell participant they are waiting
      socket.emit('waiting-for-approval');
      return; // Stop here, wait for host approval
    }

    // For hosts, join immediately
    socket.join(roomId);
    console.log(`Host ${socket.id} joined room ${roomId}`, userData);

    // If host joins, send them the current waiting list
    if (isHost && waitingRooms.has(roomId)) {
      const waiting = Array.from(waitingRooms.get(roomId).values());
      if (waiting.length > 0) {
        socket.emit('waiting-participants-list', waiting);
      }
    }

    // Track user in room (only if userData is provided)
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

      // Broadcast updated user list to all users in room
      const users = Array.from(roomUsers.get(roomId).values());
      io.to(roomId).emit('room-users-updated', users);

      // Add user as participant in board (so it appears in their dashboard)
      try {
        await Board.findOneAndUpdate(
          { roomId },
          {
            $addToSet: {
              participants: {
                userId: userData.userId,
                role: userData.role,
                joinedAt: new Date()
              }
            }
          },
          { upsert: false } // Don't create board if it doesn't exist
        );
        console.log(`[PARTICIPANT] Added ${userData.username} (${userData.role}) to board ${roomId}`);
      } catch (err) {
        console.error('Error adding participant:', err);
      }
    }

    // Load Board History with allowed students
    try {
      let board = await Board.findOne({ roomId })
        .populate('allowedStudents', 'username email')
        .populate('createdBy', 'username');

      if (board) {
        socket.emit('load-board', {
          elements: board.elements,
          allowedStudents: board.allowedStudents || [],
          allowStudentEditing: board.allowStudentEditing || false, // FIX #95: send persisted toggle state to client
          boardName: board.name,
          teacherName: board.createdBy?.username || 'Unknown Teacher'
        });
      } else {
        socket.emit('load-board', {
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

  socket.on('accept-participant', async ({ roomId, socketId, userData }) => {
    if (waitingRooms.has(roomId)) {
      waitingRooms.get(roomId).delete(socketId);
    }

    const studentSocket = io.sockets.sockets.get(socketId);
    if (studentSocket) {
      studentSocket.join(roomId);
      studentSocket.emit('join-accepted');

      // Track user in room
      if (userData && userData.userId) {
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Map());
        }
        roomUsers.get(roomId).set(userData.userId, {
          userId: userData.userId,
          username: userData.username,
          socketId: studentSocket.id,
          role: userData.role
        });

        // Broadcast updated user list to all users in room
        const users = Array.from(roomUsers.get(roomId).values());
        io.to(roomId).emit('room-users-updated', users);

        // Add user as participant in board
        try {
          await Board.findOneAndUpdate(
            { roomId },
            {
              $addToSet: {
                participants: {
                  userId: userData.userId,
                  role: userData.role,
                  joinedAt: new Date()
                }
              }
            },
            { upsert: false }
          );
        } catch (err) {
          console.error('Error adding participant:', err);
        }
      }

      // Load Board History for the accepted participant
      try {
        let board = await Board.findOne({ roomId })
          .populate('allowedStudents', 'username email')
          .populate('createdBy', 'username');

        if (board) {
          studentSocket.emit('load-board', {
            elements: board.elements,
            allowedStudents: board.allowedStudents || [],
            allowStudentEditing: board.allowStudentEditing || false,
            boardName: board.name,
            teacherName: board.createdBy?.username || 'Unknown Teacher'
          });
        } else {
          studentSocket.emit('load-board', {
            elements: [],
            allowedStudents: [],
            allowStudentEditing: false,
            boardName: 'Untitled Board',
            teacherName: 'Unknown Teacher'
          });
        }
      } catch (err) {
        console.error('Error loading board:', err);
      }
    }
  });

  socket.on('decline-participant', ({ roomId, socketId }) => {
    if (waitingRooms.has(roomId)) {
      waitingRooms.get(roomId).delete(socketId);
    }
    const studentSocket = io.sockets.sockets.get(socketId);
    if (studentSocket) {
      studentSocket.emit('join-declined');
    }
  });

  // Real-time stroke updates (while drawing) - no DB save, just broadcast
  socket.on('drawing-stroke', async (strokeData) => {
    if (!(await isAuthorizedToEdit(strokeData.roomId, socket.userId))) return;
    socket.to(strokeData.roomId).emit('drawing-stroke', strokeData);
  });

  socket.on('draw-element', async (element) => {
    if (!(await isAuthorizedToEdit(element.roomId, socket.userId))) return;
    // Broadcast element to room
    socket.to(element.roomId).emit('draw-element', element);

    // Save to DB (Update if exists, Push if new)
    try {
      const roomId = element.roomId;
      // Try to update existing element in the array
      const updatedMatch = await Board.findOneAndUpdate(
        { roomId: roomId, "elements.id": element.id },
        {
          $set: {
            "elements.$": element,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!updatedMatch) {
        // If not found, push new element
        await Board.findOneAndUpdate(
          { roomId: roomId },
          {
            $push: { elements: element },
            $set: { updatedAt: new Date() }
          },
          { upsert: true, new: true }
        );
      }
    } catch (err) {
      console.error('Error saving element:', err);
    }
  });

  // Delete element (for undo synchronization)
  socket.on('delete-element', async ({ roomId, elementId }) => {
    if (!(await isAuthorizedToEdit(roomId, socket.userId))) return;
    console.log(`[DELETE-ELEMENT] Received from ${socket.id}, roomId: ${roomId}, elementId: ${elementId}`);
    // Broadcast deletion to room
    socket.to(roomId).emit('delete-element', elementId);
    console.log(`[DELETE-ELEMENT] Broadcasted to room ${roomId}`);

    // Remove from DB
    try {
      await Board.findOneAndUpdate(
        { roomId },
        {
          $pull: { elements: { id: elementId } },
          $set: { updatedAt: new Date() }
        }
      );
      console.log(`[DELETE-ELEMENT] Removed from DB: ${elementId}`);
    } catch (err) {
      console.error('Error deleting element:', err);
    }
  });

  // Update element (for eraser redo synchronization)
  socket.on('update-element', async ({ roomId, elementId, updates }) => {
    if (!(await isAuthorizedToEdit(roomId, socket.userId))) return;
    console.log(`[UPDATE-ELEMENT] Received from ${socket.id}, roomId: ${roomId}, elementId: ${elementId}`);
    // Broadcast update to room
    socket.to(roomId).emit('update-element', { elementId, updates });
    console.log(`[UPDATE-ELEMENT] Broadcasted to room ${roomId}`);

    // Update in DB
    try {
      await Board.findOneAndUpdate(
        { roomId, 'elements.id': elementId },
        {
          $set: {
            'elements.$': updates,
            updatedAt: new Date()
          }
        }
      );
      console.log(`[UPDATE-ELEMENT] Updated in DB: ${elementId}`);
    } catch (err) {
      console.error('Error updating element:', err);
    }
  });

  // Sync elements (for redo to maintain correct order)
  socket.on('sync-elements', async ({ roomId, elements }) => {
    if (!(await isAuthorizedToEdit(roomId, socket.userId))) return;
    console.log(`[SYNC-ELEMENTS] Received from ${socket.id}, syncing ${elements.length} elements`);
    // Broadcast full element array to all other users
    socket.to(roomId).emit('sync-elements', elements);

    // Update database with full element array
    try {
      await Board.findOneAndUpdate(
        { roomId },
        {
          $set: {
            elements: elements,
            updatedAt: new Date()
          }
        }
      );
      console.log(`[SYNC-ELEMENTS] Updated DB with ${elements.length} elements`);
    } catch (err) {
      console.error('Error syncing elements:', err);
    }
  });

  // Sync state (for redo to maintain exact element order)
  socket.on('sync-state', async ({ roomId, elements }) => {
    if (!(await isAuthorizedToEdit(roomId, socket.userId))) return;
    console.log(`[SYNC-STATE] Broadcasting ${elements.length} elements to room ${roomId}`);
    // Broadcast to all other users
    socket.to(roomId).emit('sync-state', elements);

    // Update database
    try {
      await Board.findOneAndUpdate(
        { roomId },
        {
          $set: {
            elements: elements,
            updatedAt: new Date()
          }
        }
      );
    } catch (err) {
      console.error('Error syncing state:', err);
    }
  });

  socket.on('clear-canvas', async (roomId) => {
    try {
      // FIX #94: verify the emitting user is the board owner before clearing
      const board = await Board.findOne({ roomId });
      if (!board || board.createdBy.toString() !== socket.userId) {
        return socket.emit('error', { message: 'Unauthorized: only the board teacher can clear the canvas' });
      }
      io.to(roomId).emit('clear-canvas');
      await Board.findOneAndUpdate(
        { roomId },
        { $set: { elements: [] } }
      );
    } catch (err) {
      console.error('Error clearing board:', err);
    }
  });

  // Theme synchronization
  socket.on('change-theme', async ({ roomId, isDark }) => {
    if (!(await isTeacher(roomId, socket.userId))) return;
    console.log(`[THEME-SYNC] Received change-theme from ${socket.id} for room ${roomId}, isDark: ${isDark}`);
    // Broadcast theme change to all students in room
    socket.to(roomId).emit('theme-changed', isDark);
    console.log(`[THEME-SYNC] Broadcasted theme-changed to room ${roomId}`);
  });

  socket.on('cursor-move', (data) => {
    // Optional: could protect cursor-move, but usually non-destructive
    socket.to(data.roomId).emit('cursor-move', data);
  });

  socket.on('viewport-change', (data) => {
    // Optional: non-destructive
    socket.to(data.roomId).emit('viewport-change', data);
  });

  socket.on('grant-participant-permission', async ({ roomId, studentId }) => {
    try {
      // FIX #94: verify the emitting user is the board owner
      const board = await Board.findOne({ roomId });
      if (!board || board.createdBy.toString() !== socket.userId) {
        return socket.emit('error', { message: 'Unauthorized: only the board teacher can grant permissions' });
      }
      await Board.findOneAndUpdate(
        { roomId },
        { $addToSet: { allowedStudents: studentId } }
      );

      // Notify specific student
      const roomUsersList = roomUsers.get(roomId);
      if (roomUsersList) {
        const student = roomUsersList.get(studentId);
        if (student) {
          io.to(student.socketId).emit('editing-permission-changed', true);
        }
      }
    } catch (err) {
      console.error('Error granting permission:', err);
    }
  });

  // Revoke editing permission from specific student
  socket.on('revoke-participant-permission', async ({ roomId, studentId }) => {
    try {
      // FIX #94: verify the emitting user is the board owner
      const board = await Board.findOne({ roomId });
      if (!board || board.createdBy.toString() !== socket.userId) {
        return socket.emit('error', { message: 'Unauthorized: only the board teacher can revoke permissions' });
      }
      await Board.findOneAndUpdate(
        { roomId },
        { $pull: { allowedStudents: studentId } }
      );

      // Notify specific student
      const roomUsersList = roomUsers.get(roomId);
      if (roomUsersList) {
        const student = roomUsersList.get(studentId);
        if (student) {
          io.to(student.socketId).emit('editing-permission-changed', false);
        }
      }
    } catch (err) {
      console.error('Error revoking permission:', err);
    }
  });

  // Toggle student editing permission
  socket.on('toggle-student-editing', async ({ roomId, allowEditing }) => {
    try {
      // FIX #94: verify the emitting user is the board owner
      const board = await Board.findOne({ roomId });
      if (!board || board.createdBy.toString() !== socket.userId) {
        return socket.emit('error', { message: 'Unauthorized: only the board teacher can toggle student editing' });
      }
      socket.to(roomId).emit('student-editing-changed', allowEditing);
      await Board.findOneAndUpdate(
        { roomId },
        { $set: { allowStudentEditing: allowEditing } }
      );
    } catch (err) {
      console.error('Error updating student editing permission:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove user from all rooms and waiting rooms
    roomUsers.forEach((users, roomId) => {
      for (const [userId, userData] of users.entries()) {
        if (userData.socketId === socket.id) {
          users.delete(userId);
          io.to(roomId).emit('room-users-updated', Array.from(users.values()));
          break;
        }
      }
    });

    waitingRooms.forEach((waitingList, roomId) => {
      if (waitingList.has(socket.id)) {
        waitingList.delete(socket.id);
        // Could notify teacher that student left the waiting room, but not strictly necessary
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});