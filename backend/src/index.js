const express = require('express');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);

app.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

module.exports = app;
