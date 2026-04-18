const prisma = require('../config/prisma');

const MAX_CONTEXT_LENGTH = 10000;

async function addTextContext(req, res) {
  try {
    const { botId, content } = req.body;
    const userId = req.user.id;

    if (!botId || !content) {
      return res.status(400).json({ error: 'botId and content required' });
    }

    const bot = await prisma.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const truncatedContent = content.length > MAX_CONTEXT_LENGTH
      ? content.substring(0, MAX_CONTEXT_LENGTH)
      : content;

    const context = await prisma.context.create({
      data: {
        botId,
        type: 'text',
        content: truncatedContent,
      },
    });

    res.status(201).json({ context });
  } catch (error) {
    console.error('Add text context error:', error);
    res.status(500).json({ error: 'Failed to add text context' });
  }
}

async function addFaqContext(req, res) {
  try {
    const { botId, faqs } = req.body;
    const userId = req.user.id;

    if (!botId || !faqs || !Array.isArray(faqs)) {
      return res.status(400).json({ error: 'botId and faqs array required' });
    }

    if (faqs.length === 0) {
      return res.status(400).json({ error: 'At least one FAQ required' });
    }

    const bot = await prisma.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    for (const faq of faqs) {
      if (!faq.question || !faq.answer) {
        return res.status(400).json({ error: 'Each FAQ must have question and answer' });
      }
    }

    const context = await prisma.context.create({
      data: {
        botId,
        type: 'faq',
        content: JSON.stringify(faqs),
      },
    });

    const parsed = JSON.parse(context.content);
    res.status(201).json({ context: { ...context, content: parsed } });
  } catch (error) {
    console.error('Add FAQ context error:', error);
    res.status(500).json({ error: 'Failed to add FAQ context' });
  }
}

async function listContexts(req, res) {
  try {
    const { botId } = req.params;
    const userId = req.user.id;

    const bot = await prisma.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const contexts = await prisma.context.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = contexts.map(c => ({
      ...c,
      content: c.type === 'faq' ? JSON.parse(c.content) : c.content,
    }));

    res.json({ contexts: parsed });
  } catch (error) {
    console.error('List contexts error:', error);
    res.status(500).json({ error: 'Failed to list contexts' });
  }
}

async function deleteContext(req, res) {
  try {
    const { botId, contextId } = req.params;
    const userId = req.user.id;

    const bot = await prisma.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const context = await prisma.context.findFirst({
      where: { id: contextId, botId },
    });
    if (!context) {
      return res.status(404).json({ error: 'Context not found' });
    }

    await prisma.context.delete({ where: { id: contextId } });

    res.json({ message: 'Context deleted' });
  } catch (error) {
    console.error('Delete context error:', error);
    res.status(500).json({ error: 'Failed to delete context' });
  }
}

module.exports = { addTextContext, addFaqContext, listContexts, deleteContext };
