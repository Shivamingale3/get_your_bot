const prisma = require('../config/prisma');
const multer = require('multer');
const path = require('path');
const { uploadFile } = require('../services/cloudinaryService');
const { extractTextFromPDF, truncateText } = require('../services/pdfService');
const { summarizeDocument } = require('../services/summarizeService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDFs allowed'));
    }
    cb(null, true);
  },
});

async function uploadDocument(req, res) {
  try {
    const { botId } = req.body;
    const userId = req.user.id;

    if (!botId) {
      return res.status(400).json({ error: 'botId required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'PDF file required' });
    }

    const bot = await prisma.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const tempPath = `/tmp/${Date.now()}-${req.file.originalname}`;
    require('fs').writeFileSync(tempPath, req.file.buffer);

    const fileUrl = await uploadFile(tempPath);

    require('fs').unlinkSync(tempPath);

    const extractedText = await extractTextFromPDF(req.file.buffer);
    const truncatedText = truncateText(extractedText);

    let summary = '';
    try {
      summary = await summarizeDocument(truncatedText, bot.provider, bot.apiKeyEncrypted);
    } catch (aiError) {
      console.error('AI summarization failed:', aiError.message);
      // Fallback: use the extracted text as the summary
      summary = truncatedText.substring(0, 500);
    }

    const document = await prisma.document.create({
      data: {
        botId,
        fileUrl,
        extractedText: truncatedText,
        summary,
      },
    });

    res.status(201).json({ document });
  } catch (error) {
    console.error('Upload document error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to upload document', details: error.message });
  }
}

async function listDocuments(req, res) {
  try {
    const { botId } = req.params;
    const userId = req.user.id;

    const bot = await prisma.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const documents = await prisma.document.findMany({
      where: { botId },
      select: { id: true, fileUrl: true, summary: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ documents });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to list documents' });
  }
}

async function deleteDocument(req, res) {
  try {
    const { botId, documentId } = req.params;
    const userId = req.user.id;

    const bot = await prisma.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, botId },
    });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await prisma.document.delete({ where: { id: documentId } });

    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
}

module.exports = { uploadDocument, listDocuments, deleteDocument, upload };
