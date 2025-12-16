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

// Routes
app.use('/api/auth', authRoutes);

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



// ...

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Load Board History
    try {
      let board = await Board.findOne({ roomId });
      if (board) {
        socket.emit('load-board', board.elements);
      } else {
        socket.emit('load-board', []);
      }
    } catch (err) {
      console.error('Error loading board:', err);
    }
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
        { $set: { "elements.$": element } },
        { new: true }
      );

      if (!updatedMatch) {
        // If not found, push new element
        await Board.findOneAndUpdate(
          { roomId: roomId },
          { $push: { elements: element } },
          { upsert: true, new: true }
        );
      }
    } catch (err) {
      console.error('Error saving element:', err);
    }
  });

  socket.on('clear-canvas', async (roomId) => {
    socket.to(roomId).emit('clear-canvas');
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

  socket.on('cursor-move', (data) => {
    socket.to(data.roomId).emit('cursor-move', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
