const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../authMiddleware');
const Group = require('../models/Group');

function buildGroupsRouter() {
  const router = express.Router();

  router.get('/groups/my', authMiddleware, async function (req, res) {
    const userId = req.user.id;

    console.log('[groups] userId:', userId, '| mongoose state:', mongoose.connection.readyState);

    if (mongoose.connection.readyState !== 1) {
      return res.json({ groups: [] });
    }

    try {
      const userObjId = new mongoose.Types.ObjectId(userId);

      const arr = await Group.find({
        $or: [{ owner: userObjId }, { members: userObjId }]
      }).lean();

      console.log('[groups] found:', arr.length);

      const groups = arr.map(function (g) {
        return {
          id: g._id.toString(),
          name: g.groupName,
          currency: g.currency || 'DH'
        };
      });

      res.json({ groups: groups });
    } catch (err) {
      console.log('[groups] error:', err.message);
      res.status(500).json({ error: 'Could not load groups.' });
    }
  });

  return router;
}

module.exports = buildGroupsRouter;