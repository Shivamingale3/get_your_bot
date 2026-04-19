const prisma = require('../config/prisma');
const { getAIResponse } = require('../services/aiService');
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

    let response;
    try {
      response = await getAIResponse(bot.provider, bot.apiKeyEncrypted, prompt);
    } catch (aiError) {
      console.error('AI response error:', aiError.message);
      // Fallback: search document content for answers
      if (bot.documents.length > 0) {
        const docSummaries = bot.documents.map(d => d.summary).join('\n');
        const messageLower = message.toLowerCase();

        // Simple keyword matching
        if (messageLower.includes('pricing') || messageLower.includes('price') || messageLower.includes('cost')) {
          if (docSummaries.toLowerCase().includes('pricing') || docSummaries.toLowerCase().includes('cost')) {
            const match = docSummaries.match(/Pricing[^.]+\.|cost[^.]+\.|\\$\d+[^.]+/gi);
            if (match) {
              return res.json({ response: match[0] });
            }
          }
        }

        if (messageLower.includes('support') || messageLower.includes('email') || messageLower.includes('contact')) {
          if (docSummaries.toLowerCase().includes('support')) {
            const match = docSummaries.match(/Support[^.]+|email[^.]+|contact[^.]+/gi);
            if (match) {
              return res.json({ response: match[0] });
            }
          }
        }

        return res.json({
          response: "I apologize, but I'm having trouble connecting to my AI service right now. However, I found relevant information in your documents: " + docSummaries.substring(0, 500)
        });
      }
      return res.status(500).json({ error: 'Chat failed', details: aiError.message });
    }

    await prisma.chatLog.create({
      data: { botId, question: message, response },
    });

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error.message, error.stack);
    res.status(500).json({ error: 'Chat failed' });
  }
}

module.exports = { chat };
