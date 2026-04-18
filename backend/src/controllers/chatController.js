const prisma = require('../config/prisma');
const { chat } = require('../services/aiService');
const { buildPrompt } = require('../services/promptBuilder');

async function chat(req, res) {
  try {
    const { botId, message } = req.body;

    if (!botId || !message) {
      return res.status(400).json({ error: 'botId and message required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 chars)' });
    }

    const bot = await prisma.bot.findFirst({
      where: { id: botId },
      include: {
        contexts: true,
        documents: { select: { summary: true } },
      },
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const prompt = buildPrompt(bot.contexts, bot.documents, message);

    const response = await chat(bot.provider, bot.apiKeyEncrypted, prompt);

    await prisma.chatLog.create({
      data: { botId, question: message, response },
    });

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
}

module.exports = { chat };
