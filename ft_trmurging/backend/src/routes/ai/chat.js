const express = require('express');
const Auth = require('../../controllers/middleware');
const dataSource = require('../../services/ai/dataSource');
const ragEngine = require('../../services/ai/ragEngine');

const router = express.Router();

// ============================================================
// POST /chat/group/:groupId/stream
// ------------------------------------------------------------
// SSE endpoint for the per-group AI assistant.
//
// Body:
//   { question: string }
//
// URL params:
//   groupId : the MongoDB ObjectId of the group
//
// Response (Server-Sent Events):
//   event: token    { text: "..." }   ← streamed LLM tokens
//   event: sources  { sources: [...] } ← retrieved chunks
//   event: done     {}                ← end of stream
//   event: error    { message: "..." } ← on failure
//
// Security:
//   - Auth middleware enforces req.session.userId
//   - dataSource.loadGroupDocuments() returns null if the user
//     is not owner/member of the group
// ============================================================
router.post('/chat/group/:groupId/stream', Auth, async function (req, res) {
  const question = (req.body.question || '').trim();
  const groupId = req.params.groupId;

  if (!question) {
    return res.status(400).json({ error: 'Question required' });
  }

  if (!groupId) {
    return res.status(400).json({ error: 'Group ID required' });
  }

  // SSE headers 
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  function send(name, data) {
    res.write('event: ' + name + '\n');
    res.write('data: ' + JSON.stringify(data) + '\n\n');
  }

  try {
    const userId = req.session.userId;

    const userContext = await dataSource.loadUserContext(userId, groupId);

    if (!userContext) {
      send('token', { text: 'تعذر تحميل معلوماتك.' });
      send('done', {});
      return res.end();
    }

    const result = await dataSource.loadGroupDocuments(userId, groupId);

    if (!result) {
      send('token', { text: 'لا تملك صلاحية الوصول لهذه المجموعة.' });
      send('done', {});
      return res.end();
    }

    const userDocs = [];

    userDocs.push(
      'المستخدم الحالي الذي يسأل اسمه "' + userContext.username + '" ' +
      'وإيميله "' + userContext.email + '".'
    );

    if (userContext.currentGroup) {
      const ownerName = userContext.currentGroup.owner
        ? userContext.currentGroup.owner.username
        : 'مجهول';

      userDocs.push(
        'أنت الآن داخل مجموعة "' + userContext.currentGroup.groupName + '". ' +
        'صلاحيتك في هذه المجموعة: ' + userContext.role + '. ' +
        'صاحب المجموعة هو: ' + ownerName + '.'
      );
    }

    const allDocs = userDocs.concat(result.docs);

    const rag = new ragEngine(
      process.env.GROQ_API_KEY,
      process.env.EMBEDDINGS_API_KEY,
      process.env.EMBEDDINGS_BASE_URL,
      process.env.EMBEDDINGS_MODEL,
      process.env.EMBEDDINGS_PATH
    );

    const enrichedQuestion =
      '[سياق مهم:]\n' +
      '- المستخدم الذي يسألك اسمه: ' + userContext.username + '\n' +
      '- إيميله: ' + userContext.email + '\n' +
      '- المجموعة الحالية: ' +
        (userContext.currentGroup
          ? userContext.currentGroup.groupName
          : 'غير محددة') + '\n' +
      '- صلاحيته في المجموعة: ' + userContext.role + '\n' +
      '- أجب فقط عن هذه المجموعة وهذا المستخدم.\n' +
      '- إذا سأل عن نفسه ("من أنا؟"، "ما اسمي؟"، "شكون أنا؟") استخدم المعلومات أعلاه.\n' +
      '- إذا سأل عن المجموعة استخدم بيانات المجموعة.\n\n' +
      'السؤال: ' + question;

    await rag.ingest(allDocs);

    const ragResult = await rag.ask(enrichedQuestion, function (token) {
      send('token', { text: token });
    });

    send('sources', { sources: ragResult.sources });
    send('done', {});
    res.end();
  } catch (error) {
    console.log('[ai-chat/group] error:', error.message);
    send('error', { message: 'حدث خطأ.' });
    res.end();
  }
});

module.exports = router;







