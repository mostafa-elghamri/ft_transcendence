const express = require('express');
const RAGEngine = require('../ragEngine');
const LLMClient = require('../llmClient');
const PromptBuilder = require('../promptBuilder');
const dataSource = require('../dataSource');
const mockData = require('../mockData');
const authenticateJWT = require('../authMiddleware');
const rateLimiter = require('../rateLimiter');

function buildChatRouter(db) {
    const router = express.Router();

    async function getUserDocuments(userId) {
        if (db) {
            return await dataSource.loaddocs(db, userId);
        }
        return await mockData.loadMockDocuments(userId);
    }

    router.post(
        '/chat/stream',
        authenticateJWT,
        rateLimiter.chatRateLimiter,
        async function (req, res) {
            const question = req.body.question;

            if (!question || typeof question !== 'string' || question.trim().length === 0) {
                res.status(400).json({
                    error: 'Please send a non-empty question field as a string.'
                });
                return;
            }

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();

            function sendEvent(name, data) {
                res.write('event: ' + name + '\n');
                res.write('data: ' + JSON.stringify(data) + '\n\n');
            }

            const userId = req.user.id;
            let disconnected = false;

            req.on('close', function () {
                disconnected = true;
            });

            try {
                const documents = await getUserDocuments(userId);

                if (documents.length === 0) {
                    sendEvent('token', { text: 'Not enough data yet.' });
                    sendEvent('done', {});
                    res.end();
                    return;
                }

                const rag = new RAGEngine(process.env.GROQ_API_KEY);
                rag.ingest(documents);

                const sources = rag.retriever.retrieve(question, 3);
                sendEvent('sources', { sources });

                const prompt = new PromptBuilder();
                const text = prompt.build(question, sources);

                const llm = new LLMClient(process.env.GROQ_API_KEY);

                await llm.generateStream(text, function (token) {
                    if (disconnected === false) {
                        sendEvent('token', { text: token });
                    }
                });

                if (disconnected === false) {
                    sendEvent('done', {});
                    res.end();
                }
            } catch (error) {
                console.log('[chat/stream] error:', error);

                if (disconnected === false) {
                    sendEvent('error', {
                        message: 'An unexpected error occurred.'
                    });
                    res.end();
                }
            }
        }
    );

    return router;
}

module.exports = buildChatRouter;