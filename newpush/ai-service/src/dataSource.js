const mongoose = require('mongoose');
const User = require('./models/User');

const Group = require('./models/Group');
const Expense = require('./models/Expense');
const Settlement = require('./models/Settlement');

function formatDate(date) {
  if (!date) return 'بدون تاريخ';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'بدون تاريخ';
  return d.toISOString().slice(0, 10);
}

function findGroup(groups, id) {
  if (!id) return null;
  const target = id.toString();
  for (let i = 0; i < groups.length; i++) {
    if (groups[i]._id.toString() === target) return groups[i];
  }
  return null;
}

async function loadUserDocuments(userId) {
  const userObjId = new mongoose.Types.ObjectId(userId);

  const groups = await Group.find({
    $or: [{ owner: userObjId }, { members: userObjId }]
  })
    .populate('members', 'username')
    .lean();

  if (groups.length === 0) return [];

  const groupIds = groups.map(g => g._id);

  const expenses = await Expense.find({ group: { $in: groupIds } })
    .sort({ date: -1 })
    .limit(100)
    .populate('payer', 'username')
    .populate('participants', 'username')
    .lean();

  const settlements = await Settlement.find({
    $or: [{ fromUser: userObjId }, { toUser: userObjId }]
  })
    .populate('fromUser', 'username')
    .populate('toUser', 'username')
    .lean();

  const totals = await Expense.aggregate([
    { $match: { group: { $in: groupIds } } },
    { $group: { _id: '$group', total: { $sum: '$amount' } } }
  ]);

  const docs = [];

  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];
    const group = findGroup(groups, e.group);
    const payer = e.payer ? e.payer.username : 'مجهول';
    const parts = [];

    if (e.participants) {
      for (let j = 0; j < e.participants.length; j++) {
        const p = e.participants[j];
        if (p && p.username) parts.push(p.username);
      }
    }

    docs.push(
      'مصروف بعنوان "' + (e.description || 'بدون وصف') + '" ' +
      'بمبلغ ' + e.amount + ' درهم ' +
      'دفعه ' + payer + ' ' +
      'بتاريخ ' + formatDate(e.date) + ' ' +
      'ضمن مجموعة "' + (group ? group.groupName : 'مجهولة') + '"، ' +
      'وتم تقسيمه بين: ' + parts.join('، ') + '.'
    );
  }

  for (let i = 0; i < settlements.length; i++) {
    const s = settlements[i];
    const group = findGroup(groups, s.group);
    const from = s.fromUser ? s.fromUser.username : 'مجهول';
    const to = s.toUser ? s.toUser.username : 'مجهول';

    docs.push(
      from + ' دفع لـ ' + to + ' بمبلغ ' + s.amount + ' درهم ' +
      'ضمن مجموعة "' + (group ? group.groupName : 'مجهولة') + '".'
    );
  }

  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    let total = 0;

    for (let j = 0; j < totals.length; j++) {
      if (totals[j]._id.toString() === g._id.toString()) {
        total = totals[j].total;
        break;
      }
    }

    const memberNames = [];

    if (g.members) {
      for (let j = 0; j < g.members.length; j++) {
        const m = g.members[j];
        if (m && m.username) memberNames.push(m.username);
      }
    }

    docs.push(
      'مجموعة "' + g.groupName + '" ' +
      'تضم الأعضاء: ' + memberNames.join('، ') + '، ' +
      'وإجمالي مصاريفها: ' + total + ' درهم.'
    );
  }

  return docs;
}

module.exports = { loadUserDocuments };