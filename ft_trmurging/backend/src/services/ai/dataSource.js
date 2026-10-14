const User = require('../../models/Schemas/User');
const Group = require('../../models/Schemas/Group');
const Expense = require('../../models/Schemas/Expenses');
const Settlement = require('../../models/Schemas/Settlement');

// ============================================================
// Load data for one group only
// Schema: { name, createdBy, members: [{ userId, role }] }
// ============================================================
async function loadGroupDocuments(userId, groupId) {
  const group = await Group.findOne({
    _id: groupId,
    $or: [
      { createdBy: userId },
      { 'members.userId': userId }
    ]
  })
    .populate('members.userId', 'username')
    .populate('createdBy', 'username')
    .lean();

  if (!group) {
    return null;
  }

  const expenses = await Expense.find({ group: groupId })
    .sort({ date: -1 })
    .limit(200)
    .populate('payer', 'username')
    .populate('participants', 'username')
    .lean();

  const settlements = await Settlement.find({ group: groupId })
    .populate('fromUser', 'username')
    .populate('toUser', 'username')
    .lean();

  const totalAgg = await Expense.aggregate([
    { $match: { group: group._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  let total = 0;
  if (totalAgg.length > 0) {
    total = totalAgg[0].total;
  }

  const docs = [];

  // Members (new schema: members[i].userId.username)
  const memberNames = [];
  for (let i = 0; i < group.members.length; i++) {
    const m = group.members[i];
    if (m && m.userId && m.userId.username) {
      memberNames.push(m.userId.username);
    }
  }

  let ownerName = 'مجهول';
  if (group.createdBy && group.createdBy.username) {
    ownerName = group.createdBy.username;
  }

  docs.push(
    'المجموعة الحالية اسمها "' + group.name + '" ' +
    'وصاحبها هو ' + ownerName + '، ' +
    'وتضم الأعضاء: ' + memberNames.join('، ') + '. ' +
    'إجمالي مصاريف هذه المجموعة: ' + total + ' درهم.'
  );

  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];
    let payer = 'مجهول';
    if (e.payer) payer = e.payer.username;

    const parts = [];
    if (e.participants) {
      for (let j = 0; j < e.participants.length; j++) {
        if (e.participants[j] && e.participants[j].username) {
          parts.push(e.participants[j].username);
        }
      }
    }

    let description = 'بدون وصف';
    if (e.description) description = e.description;

    docs.push(
      'مصروف بعنوان "' + description + '" ' +
      'بمبلغ ' + e.amount + ' درهم ' +
      'دفعه ' + payer + ' ' +
      'بتاريخ ' + formatDate(e.date) + ' ' +
      'وتم تقسيمه بين: ' + parts.join('، ') + '.'
    );
  }

  for (let i = 0; i < settlements.length; i++) {
    const s = settlements[i];
    let from = 'مجهول';
    if (s.fromUser) from = s.fromUser.username;
    let to = 'مجهول';
    if (s.toUser) to = s.toUser.username;

    docs.push(from + ' دفع لـ ' + to + ' بمبلغ ' + s.amount + ' درهم.');
  }

  return {
    groupName: group.name,
    docs: docs
  };
}

// ============================================================
// Load user info (Who am I?)
// ============================================================
async function loadUserContext(userId, groupId) {
  const user = await User.findById(userId, 'username email').lean();
  if (!user) return null;

  let currentGroup = null;
  let userRole = 'member';

  if (groupId) {
    currentGroup = await Group.findOne({
      _id: groupId,
      $or: [
        { createdBy: userId },
        { 'members.userId': userId }
      ]
    })
      .populate('createdBy', 'username')
      .populate('members.userId', 'username')
      .lean();

    if (currentGroup && currentGroup.createdBy) {
      if (currentGroup.createdBy._id.toString() === userId.toString()) {
        userRole = 'owner';
      }
    }
  }

  // Map new schema → what chat.js expects
  let mapped = null;
  if (currentGroup) {
    const memberUsers = [];
    for (let i = 0; i < currentGroup.members.length; i++) {
      const m = currentGroup.members[i];
      if (m && m.userId) {
        memberUsers.push(m.userId);
      }
    }

    mapped = {
      _id: currentGroup._id,
      groupName: currentGroup.name,
      owner: currentGroup.createdBy,
      members: memberUsers
    };
  }

  return {
    username: user.username,
    email: user.email,
    role: userRole,
    currentGroup: mapped
  };
}

// ============================================================
// Helpers
// ============================================================
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

// ============================================================
// Exports
// ============================================================
module.exports = {
  loadGroupDocuments,
  loadUserContext
};