function buildPrompt(contexts, documents, userMessage) {
  let contextSection = '';

  for (const ctx of contexts) {
    if (ctx.type === 'text') {
      contextSection += `${ctx.content}\n\n`;
    } else if (ctx.type === 'faq') {
      const faqs = typeof ctx.content === 'string' ? JSON.parse(ctx.content) : ctx.content;
      for (const faq of faqs) {
        contextSection += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
      }
    }
  }

  for (const doc of documents) {
    contextSection += `[Document Summary]\n${doc.summary}\n\n`;
  }

  const prompt = `You are a helpful support assistant.

Context:
${contextSection}
Rules:
- Answer ONLY using provided context
- If answer not found, say "I don't know"

User:
${userMessage}`;

  return prompt.length > 12000 ? prompt.substring(0, 12000) : prompt;
}

module.exports = { buildPrompt };
