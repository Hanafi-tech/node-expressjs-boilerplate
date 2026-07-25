'use strict';

/**
 * SAMPLE: OpenAI Integration
 * ───────────────────────────
 * openai — client resmi OpenAI (chat, embedding, dll)
 *
 * Setup .env:
 *   OPENAI_API_KEY=sk-...
 *   OPENAI_BASE_URL=https://api.openai.com/v1   (opsional, untuk proxy/custom endpoint)
 *   OPENAI_MODEL=gpt-4o-mini                    (opsional, default gpt-4o-mini)
 *
 * Cara pakai di controller:
 *   const ai = require('@my_module/samples/openai.sample');
 */

const OpenAI = require('openai');

// ── Singleton client ─────────────────────────────────────────────
const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY belum diset di .env');
  }
  return new OpenAI({
    apiKey:  process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  });
};

// ─────────────────────────────────────────────────────────────────
// 1. CHAT — tanya jawab sederhana
// ─────────────────────────────────────────────────────────────────
/**
 * Contoh penggunaan di controller:
 *
 * const { chat } = require('@my_module/samples/openai.sample');
 *
 * const askAi = async (req, res) => {
 *   const { message } = req.body;
 *   const reply = await chat(message, 'Kamu adalah asisten yang ramah dan membantu.');
 *   return res.json({ reply });
 * };
 */
const chat = async (userMessage, systemPrompt = 'You are a helpful assistant.', options = {}) => {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model:      process.env.OPENAI_MODEL || 'gpt-4o-mini',
    max_tokens: options.maxTokens  || 500,
    temperature: options.temperature || 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage },
    ],
  });
  return completion.choices[0]?.message?.content || '';
};

// ─────────────────────────────────────────────────────────────────
// 2. CHAT dengan HISTORY (multi-turn conversation)
// ─────────────────────────────────────────────────────────────────
/**
 * history = [{ role: 'user'|'assistant', content: string }]
 *
 * const chatWithHistory = async (req, res) => {
 *   const { message, history = [] } = req.body;
 *   const { reply, usage } = await chatMultiTurn(
 *     message,
 *     history.slice(-10), // batas 10 pesan terakhir
 *     'Kamu adalah asisten yang membantu.'
 *   );
 *   return res.json({ reply, usage });
 * };
 */
const chatMultiTurn = async (userMessage, history = [], systemPrompt = 'You are a helpful assistant.', options = {}) => {
  const client = getClient();

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.filter(h => ['user', 'assistant'].includes(h.role) && h.content),
    { role: 'user', content: userMessage },
  ];

  const completion = await client.chat.completions.create({
    model:       process.env.OPENAI_MODEL || 'gpt-4o-mini',
    max_tokens:  options.maxTokens   || 500,
    temperature: options.temperature || 0.7,
    messages,
  });

  return {
    reply: completion.choices[0]?.message?.content || '',
    usage: completion.usage,
  };
};

// ─────────────────────────────────────────────────────────────────
// 3. EMBEDDING — ubah teks jadi vector (untuk semantic search)
// ─────────────────────────────────────────────────────────────────
/**
 * const { getEmbedding } = require('@my_module/samples/openai.sample');
 *
 * const vector = await getEmbedding('Teks yang ingin dikonversi ke embedding');
 * // vector = [0.012, -0.034, ...] (1536 dimensi untuk text-embedding-3-small)
 */
const getEmbedding = async (text, model = 'text-embedding-3-small') => {
  const client = getClient();
  const response = await client.embeddings.create({ model, input: text });
  return response.data[0].embedding;
};

// ─────────────────────────────────────────────────────────────────
// 4. ROUTE SAMPLE — siap dipasang langsung
// ─────────────────────────────────────────────────────────────────
/**
 * Tambahkan ke routes/index.js:
 *   routers.use('/ai', require('./api/aiRoute.sample'));
 *
 * Buat file src/routes/api/aiRoute.sample.js:
 *
 *   const express = require('express');
 *   const { body } = require('express-validator');
 *   const { validate } = require('@/middleware/validators/index.js');
 *   const { chatMultiTurn } = require('@my_module/samples/openai.sample');
 *   const router = express.Router();
 *
 *   router.post('/chat',
 *     validate([
 *       body('message').notEmpty().withMessage('Message wajib diisi.'),
 *       body('history').optional().isArray(),
 *     ]),
 *     async (req, res) => {
 *       try {
 *         const { message, history = [] } = req.body;
 *         const { reply, usage } = await chatMultiTurn(message, history);
 *         return res.json({ reply, usage });
 *       } catch (error) {
 *         if (error?.status === 401) return res.status(500).json({ msg: 'API key tidak valid.' });
 *         if (error?.status === 429) return res.status(429).json({ msg: 'Rate limit, coba lagi nanti.' });
 *         return res.status(500).json({ msg: error.message });
 *       }
 *     }
 *   );
 *
 *   module.exports = router;
 */

module.exports = { chat, chatMultiTurn, getEmbedding };
