const express = require('express');
const { createBot, listBots, getBot, updateBot, deleteBot } = require('../controllers/botController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createBot);
router.get('/', listBots);
router.get('/:id', getBot);
router.put('/:id', updateBot);
router.delete('/:id', deleteBot);

module.exports = router;
