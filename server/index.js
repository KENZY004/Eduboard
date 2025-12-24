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

// Create a new named board
app.post('/api/boards/create', async (req, res) => {
  try {
    const { name, userId, roomId } = req.body;

    if (!name || !userId || !roomId) {
      return res.status(400).json({ message: 'Name, userId, and roomId are required' });
    }

    const newBoard = new Board({
      roomId,
      name,
      createdBy: userId,
      elements: [],
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

// Get all boards for a specific user
app.get('/api/boards/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const boards = await Board.find({ createdBy: userId })
      .select('roomId name createdAt updatedAt')
      .sort({ updatedAt: -1 }); // Most recently updated first

    res.json(boards);
  } catch (err) {
    console.error('Error fetching user boards:', err);
    res.status(500).json({ message: 'Failed to fetch boards' });
  }
});

// Get specific board details
app.get('/api/boards/:roomId', async (req, res) => {
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

// Delete a board
app.delete('/api/boards/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.query; // Get userId from query params for authorization

    // Find and delete the board only if it belongs to the user
    const result = await Board.findOneAndDelete({
      roomId,
      createdBy: userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Board not found or unauthorized' });
    }

    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    console.error('Error deleting board:', err);
    res.status(500).json({ message: 'Failed to delete board' });
  }
});

// Get saved boards for a student
app.get('/api/boards/saved/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user and populate saved boards
    const user = await User.findById(userId).populate({
      path: 'savedBoards',
      select: 'name roomId createdBy updatedAt',
      populate: {
        path: 'createdBy',
        select: 'username'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.savedBoards || []);
  } catch (err) {
    console.error('Error fetching saved boards:', err);
    res.status(500).json({ message: 'Failed to fetch saved boards' });
  }
});

// Save a board to student's saved list
app.post('/api/boards/save/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params;
    const { userId } = req.body;

    // Check if board exists
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Add board to user's saved boards if not already saved
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.savedBoards.includes(boardId)) {
      user.savedBoards.push(boardId);
      await user.save();
    }

    res.json({ message: 'Board saved successfully' });
  } catch (err) {
    console.error('Error saving board:', err);
    res.status(500).json({ message: 'Failed to save board' });
  }
});

// Unsave a board from student's saved list
app.delete('/api/boards/unsave/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params;
    const { userId } = req.query;

    // Remove board from user's saved boards
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.savedBoards = user.savedBoards.filter(id => id.toString() !== boardId);
    await user.save();

    res.json({ message: 'Board unsaved successfully' });
  } catch (err) {
    console.error('Error unsaving board:', err);
    res.status(500).json({ message: 'Failed to unsave board' });
  }
});



// Track connected users per room
const roomUsers = new Map(); // roomId -> Map of userId -> { username, socketId, role }

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId, userData) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`, userData);

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
    }

    // Load Board History with allowed students
    try {
      let board = await Board.findOne({ roomId }).populate('allowedStudents', 'username email');
      if (board) {
        socket.emit('load-board', {
          elements: board.elements,
          allowedStudents: board.allowedStudents || []
        });
      } else {
        socket.emit('load-board', {
          elements: [],
          allowedStudents: []
        });
      }
    } catch (err) {
      console.error('Error loading board:', err);
    }
  });

  // Real-time stroke updates (while drawing) - no DB save, just broadcast
  socket.on('drawing-stroke', (strokeData) => {
    socket.to(strokeData.roomId).emit('drawing-stroke', strokeData);
  });

  socket.on('draw-element', async (element) => {
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
    // Broadcast deletion to room
    socket.to(roomId).emit('delete-element', elementId);

    // Remove from DB
    try {
      await Board.findOneAndUpdate(
        { roomId },
        {
          $pull: { elements: { id: elementId } },
          $set: { updatedAt: new Date() }
        }
      );
    } catch (err) {
      console.error('Error deleting element:', err);
    }
  });

  socket.on('clear-canvas', async (roomId) => {
    // Broadcast to ALL users in room (including sender)
    io.to(roomId).emit('clear-canvas');
    // Clear DB
    try {
      await Board.findOneAndUpdate(
        { roomId },
        { $set: { elements: [] } },
        { upsert: true }
      );
    } catch (err) {
      console.error('Error clearing board:', err);
    }
  });

  // Theme synchronization
  socket.on('change-theme', ({ roomId, isDark }) => {
    console.log(`[THEME-SYNC] Received change-theme from ${socket.id} for room ${roomId}, isDark: ${isDark}`);
    // Broadcast theme change to all students in room
    socket.to(roomId).emit('theme-changed', isDark);
    console.log(`[THEME-SYNC] Broadcasted theme-changed to room ${roomId}`);
  });

  socket.on('cursor-move', (data) => {
    socket.to(data.roomId).emit('cursor-move', data);
  });

  socket.on('viewport-change', (data) => {
    socket.to(data.roomId).emit('viewport-change', data);
  });

  // Grant editing permission to specific student
  socket.on('grant-student-permission', async ({ roomId, studentId }) => {
    try {
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
  socket.on('revoke-student-permission', async ({ roomId, studentId }) => {
    try {
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
    // Broadcast to all users in room
    socket.to(roomId).emit('student-editing-changed', allowEditing);

    // Update database
    try {
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

    // Remove user from all rooms
    roomUsers.forEach((users, roomId) => {
      for (const [userId, userData] of users.entries()) {
        if (userData.socketId === socket.id) {
          users.delete(userId);
          // Broadcast updated user list
          io.to(roomId).emit('room-users-updated', Array.from(users.values()));
          break;
        }
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
