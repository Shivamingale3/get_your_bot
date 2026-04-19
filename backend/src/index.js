const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const authRoutes = require('./routes/auth');
const botRoutes = require('./routes/bots');
const contextRoutes = require('./routes/context');
const chatRoutes = require('./routes/chat');
const documentRoutes = require('./routes/documents');
const authMiddleware = require('./middleware/auth');

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../static')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/bots', botRoutes);
app.use('/context', contextRoutes);
app.use('/chat', chatRoutes);
app.use('/documents', documentRoutes);

app.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

module.exports = app;
