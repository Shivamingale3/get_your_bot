const { getAIResponse } = require('./aiService');

async function summarizeDocument(text, provider, apiKeyEncrypted) {
  const prompt = `Summarize this document for chatbot usage. Focus on key facts, important details, and information that would be useful for answering user questions:

${text.substring(0, 8000)}`;

  const summary = await getAIResponse(provider, apiKeyEncrypted, prompt);
  return summary;
}

module.exports = { summarizeDocument };
