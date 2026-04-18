const express = require('express');
const { addTextContext, addFaqContext, listContexts, deleteContext } = require('../controllers/contextController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/text', addTextContext);
router.post('/faq', addFaqContext);
router.get('/:botId', listContexts);
router.delete('/:botId/:contextId', deleteContext);

module.exports = router;
