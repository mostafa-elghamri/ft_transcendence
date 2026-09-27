const {
    getnames,
    getgroupname,
    tostr
} = require('../utils/idUtils');

function pickCurrency(obj)
{
    if (!obj)
    {
        return 'd';
    }

    if (obj.currency !== undefined && obj.currency !== null)
    {
        return obj.currency;
    }
    else
    {
        return 'd';
    }
}

function expensetxte(expense, names, groupnames)
{
    const currency = pickCurrency(expense);
    const paidBy = getnames(names, expense.paidBy);
    const group = getgroupname(groupnames, expense.groupId);

    let split = [];

    if (expense.splitBetween && expense.splitBetween.length > 0)
    {
        for (const id of expense.splitBetween)
        {
            const username = getnames(names, id);
            split.push(username);
        }
    }
    else
    {
        split = ['all members of group'];
    }

    const text =
        'Expense titled "' + expense.description + '" ' +
        'in the amount of ' + expense.amount + ' ' + currency + ' ' +
        'paid by ' + paidBy + ' on the date ' + expense.createdAt + ' ' +
        'within a group "' + group + '", ' +
        'and it was divided between: ' + split.join(', ') + '.';

    return text;
}

function debtext(debt, names, groupnames)
{
    const currency = pickCurrency(debt);
    const debtor = getnames(names, debt.debtorId);
    const creditor = getnames(names, debt.creditorId);
    const group = getgroupname(groupnames, debt.groupId);

    const text =
        debtor + ' owes to ' + creditor + ' ' +
        'the amount of ' + debt.amount + ' ' + currency + ' ' +
        'within group "' + group + '".';

    return text;
}

function grouptxt(group, names, totals)
{
    const currency = pickCurrency(group);

    let members = [];

    if (group.members && group.members.length > 0)
    {
        for (const id of group.members)
        {
            const membername = getnames(names, id);
            members.push(membername);
        }
    }

    const idkey = tostr(group._id);

    let total = 0;

    if (totals[idkey] !== undefined && totals[idkey] !== null)
    {
        total = totals[idkey];
    }
    else
    {
        total = 0;
    }

    const text =
        'Group "' + group.name + '" ' +
        'the members include: ' + members.join(', ') + ', ' +
        'and its total expenses to date: ' + total + ' ' + currency + '.';

    return text;
}

module.exports =
{
    expensetxte,
    debtext,
    grouptxt
};