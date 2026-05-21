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
    const { name, userId, roomId } = req.body;

    if (!name || !userId || !roomId) {
      return res.status(400).json({ message: 'Name, userId, and roomId are required' });
    }

    const newBoard = new Board({
      roomId,
      name,
      createdBy: userId,
      elements: [],
      participants: [{
        userId: userId,
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

    let query = { _id: boardId };

    // If not force delete, check ownership
    if (force !== 'true') {
      query.createdBy = userId;
    }

    const result = await Board.findOneAndDelete(query);

    if (!result) {
      return res.status(404).json({ message: 'Board not found' });
    }

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


// ← REFACTORED
const { initSocketManager } = require('./socket');
initSocketManager(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
