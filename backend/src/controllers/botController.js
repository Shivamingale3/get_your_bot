const prisma = require('../config/prisma');
const { encrypt } = require('../utils/encryption');

async function createBot(req, res) {
  try {
    const { name, welcomeMessage, themeColor, provider, apiKey } = req.body;
    const userId = req.user.id;

    if (!name || !apiKey) {
      return res.status(400).json({ error: 'Name and API key required' });
    }

    if (!['openai', 'gemini'].includes(provider || 'openai')) {
      return res.status(400).json({ error: 'Provider must be openai or gemini' });
    }

    const apiKeyEncrypted = encrypt(apiKey);

    const bot = await prisma.bot.create({
      data: {
        userId,
        name,
        welcomeMessage: welcomeMessage || 'Hi! How can I help you?',
        themeColor: themeColor || '#6366f1',
        provider: provider || 'openai',
        apiKeyEncrypted,
      },
    });

    res.status(201).json({
      id: bot.id,
      name: bot.name,
      welcomeMessage: bot.welcomeMessage,
      themeColor: bot.themeColor,
      provider: bot.provider,
      createdAt: bot.createdAt,
    });
  } catch (error) {
    console.error('Create bot error:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
}

async function listBots(req, res) {
  try {
    const userId = req.user.id;

    const bots = await prisma.bot.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        welcomeMessage: true,
        themeColor: true,
        provider: true,
        createdAt: true,
        _count: {
          select: { contexts: true, documents: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bots });
  } catch (error) {
    console.error('List bots error:', error);
    res.status(500).json({ error: 'Failed to list bots' });
  }
}

async function getBot(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const bot = await prisma.bot.findFirst({
      where: { id, userId },
      include: {
        contexts: { select: { id: true, type: true, content: true, createdAt: true } },
        documents: { select: { id: true, fileUrl: true, summary: true, createdAt: true } },
      },
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json({ bot });
  } catch (error) {
    console.error('Get bot error:', error);
    res.status(500).json({ error: 'Failed to get bot' });
  }
}

async function updateBot(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, welcomeMessage, themeColor, provider, apiKey } = req.body;

    const existing = await prisma.bot.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (welcomeMessage !== undefined) data.welcomeMessage = welcomeMessage;
    if (themeColor !== undefined) data.themeColor = themeColor;
    if (provider !== undefined) data.provider = provider;
    if (apiKey !== undefined) data.apiKeyEncrypted = encrypt(apiKey);

    const bot = await prisma.bot.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        welcomeMessage: true,
        themeColor: true,
        provider: true,
        createdAt: true,
      },
    });

    res.json({ bot });
  } catch (error) {
    console.error('Update bot error:', error);
    res.status(500).json({ error: 'Failed to update bot' });
  }
}

async function deleteBot(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.bot.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    await prisma.bot.delete({ where: { id } });

    res.json({ message: 'Bot deleted' });
  } catch (error) {
    console.error('Delete bot error:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
}

module.exports = { createBot, listBots, getBot, updateBot, deleteBot };
