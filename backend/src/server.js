import http from 'node:http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the-hive';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

app.use(
  cors({
    origin: FRONTEND_ORIGIN === '*' ? true : FRONTEND_ORIGIN
  })
);
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN === '*' ? true : FRONTEND_ORIGIN
  }
});

io.on('connection', (socket) => {
  socket.on('join-room', (room) => {
    socket.join(room || 'global');
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/messages', async (req, res) => {
  const room = req.query.room || 'global';
  const messages = await Message.find({ room }).sort({ createdAt: 1 }).limit(200).lean();
  res.json(messages);
});

app.post('/api/messages', async (req, res) => {
  const { room = 'global', senderName, content } = req.body;

  if (!senderName || !content) {
    return res.status(400).json({ error: 'senderName and content are required.' });
  }

  const message = await Message.create({ room, senderName, content });
  io.to(room).emit('new-message', message);
  return res.status(201).json(message);
});

const start = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    server.listen(PORT, () => {
      console.log(`The Hive backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
