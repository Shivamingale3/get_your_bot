const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { decrypt } = require('../utils/encryption');

async function chatWithOpenAI(apiKey, prompt) {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

async function chatWithGemini(apiKey, prompt) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function chat(provider, apiKeyEncrypted, prompt) {
  const apiKey = decrypt(apiKeyEncrypted);

  if (provider === 'gemini') {
    return chatWithGemini(apiKey, prompt);
  }

  return chatWithOpenAI(apiKey, prompt);
}

module.exports = { chat, chatWithOpenAI, chatWithGemini };
