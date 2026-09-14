function expenseToText(expense) {
  var currency = expense.currency;

  if (currency === undefined || currency === null) {
    currency = 'د';
  }

  var splitBetween = expense.split_between;

  if (splitBetween === undefined || splitBetween === null) {
    splitBetween = 'كل أعضاء المجموعة';
  }

  var text = 'مصروف بعنوان "' + expense.description + '" بمبلغ ' + expense.amount + ' ' + currency + ' ';
  text = text + 'دفعه ' + expense.paid_by_name + ' بتاريخ ' + expense.created_at + ' ';
  text = text + 'ضمن مجموعة "' + expense.group_name + '"، وتم تقسيمه بين: ' + splitBetween + '.';

  return text;
}

function debtToText(debt) {
  var currency = debt.currency;

  if (currency === undefined || currency === null) {
    currency = 'د';
  }

  var text = debt.debtor_name + ' يدين لـ ' + debt.creditor_name + ' بمبلغ ' + debt.amount + ' ' + currency + ' ';
  text = text + 'ضمن مجموعة "' + debt.group_name + '".';

  return text;
}

function groupToText(group) {
  var currency = group.currency;

  if (currency === undefined || currency === null) {
    currency = 'د';
  }

  var totalExpenses = group.total_expenses;

  if (totalExpenses === undefined || totalExpenses === null) {
    totalExpenses = 0;
  }

  var members = group.members;

  if (members === undefined || members === null) {
    members = [];
  }

  var text = 'مجموعة "' + group.name + '" تضم الأعضاء: ' + members.join('، ') + '، ';
  text = text + 'وإجمالي مصاريفها حتى الآن: ' + totalExpenses + ' ' + currency + '.';

  return text;
}

function loadUserDocuments(db, userId) {
  var expensesQuery = 'SELECT e.description, e.amount, e.currency, e.created_at, e.split_between, ' +
    'u.name AS paid_by_name, g.name AS group_name ' +
    'FROM expenses e ' +
    'JOIN users u ON e.paid_by = u.id ' +
    'JOIN groups g ON e.group_id = g.id ' +
    'WHERE e.group_id IN (SELECT group_id FROM group_members WHERE user_id = $1) ' +
    'ORDER BY e.created_at DESC ' +
    'LIMIT 100';

  var debtsQuery = 'SELECT d.amount, d.currency, u1.name AS debtor_name, u2.name AS creditor_name, g.name AS group_name ' +
    'FROM debts d ' +
    'JOIN users u1 ON d.debtor_id = u1.id ' +
    'JOIN users u2 ON d.creditor_id = u2.id ' +
    'JOIN groups g ON d.group_id = g.id ' +
    'WHERE d.debtor_id = $1 OR d.creditor_id = $1';

  var groupsQuery = 'SELECT g.name, g.currency, ARRAY_AGG(u.name) AS members, ' +
    'COALESCE(SUM(e.amount), 0) AS total_expenses ' +
    'FROM groups g ' +
    'JOIN group_members gm ON gm.group_id = g.id ' +
    'JOIN users u ON u.id = gm.user_id ' +
    'LEFT JOIN expenses e ON e.group_id = g.id ' +
    'WHERE g.id IN (SELECT group_id FROM group_members WHERE user_id = $1) ' +
    'GROUP BY g.id, g.name, g.currency';

  return db.query(expensesQuery, [userId]).then(function (expensesResult) {
    return db.query(debtsQuery, [userId]).then(function (debtsResult) {
      return db.query(groupsQuery, [userId]).then(function (groupsResult) {
        var documents = [];

        for (var i = 0; i < expensesResult.rows.length; i++) {
          documents.push(expenseToText(expensesResult.rows[i]));
        }

        for (var j = 0; j < debtsResult.rows.length; j++) {
          documents.push(debtToText(debtsResult.rows[j]));
        }

        for (var k = 0; k < groupsResult.rows.length; k++) {
          documents.push(groupToText(groupsResult.rows[k]));
        }

        return documents;
      });
    });
  });
}

module.exports = {
  loadUserDocuments: loadUserDocuments,
  expenseToText: expenseToText,
  debtToText: debtToText,
  groupToText: groupToText
};
