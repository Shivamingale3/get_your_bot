const express = require('express');
const { uploadDocument, listDocuments, deleteDocument, upload } = require('../controllers/documentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:botId', listDocuments);
router.delete('/:botId/:documentId', deleteDocument);

module.exports = router;
