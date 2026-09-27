const {
    toId,
    tostr,
    makenames,
    makegroupnames
} = require('./utils/idUtils');

const {
    expensetxte,
    debtext,
    grouptxt
} = require('./formatters/textFormatters');

async function loaddocs(db, userid)
{
    const id = toId(userid);

    if (!id)
    {
        return [];
    }

    const groups = await db.collection('groups')
        .find({ members: id })
        .toArray();

    if (groups.length === 0)
    {
        return [];
    }

    const groupIds = [];

    for (const g of groups)
    {
        groupIds.push(g._id);
    }

    const expensesPromise = db.collection('expenses')
        .find({ groupId: { $in: groupIds } })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

    const debtsPromise = db.collection('debts')
        .find({
            $or: [
                { debtorId: id },
                { creditorId: id }
            ]
        })
        .toArray();

    const totalsPromise = db.collection('expenses')
        .aggregate([
            {
                $match: {
                    groupId: { $in: groupIds }
                }
            },
            {
                $group: {
                    _id: '$groupId',
                    total: { $sum: '$amount' }
                }
            }
        ])
        .toArray();

    const results = await Promise.all([
        expensesPromise,
        debtsPromise,
        totalsPromise
    ]);

    const expenses = results[0];
    const debts = results[1];
    const totals = results[2];

    const totalmap = {};

    for (const t of totals)
    {
        totalmap[tostr(t._id)] = t.total;
    }

    const userids = [];

    for (const g of groups)
    {
        if (g.members)
        {
            for (const memberId of g.members)
            {
                userids.push(memberId);
            }
        }
    }

    for (const e of expenses)
    {
        userids.push(e.paidBy);

        if (e.splitBetween)
        {
            for (const splitId of e.splitBetween)
            {
                userids.push(splitId);
            }
        }
    }

    for (const d of debts)
    {
        userids.push(d.debtorId);
        userids.push(d.creditorId);
    }

    const users = await db.collection('users')
        .find({ _id: { $in: userids } })
        .toArray();

    const names = makenames(users);
    const groupnames = makegroupnames(groups);

    const docs = [];

    for (const e of expenses)
    {
        docs.push(expensetxte(e, names, groupnames));
    }

    for (const d of debts)
    {
        docs.push(debtext(d, names, groupnames));
    }

    for (const g of groups)
    {
        docs.push(grouptxt(g, names, totalmap));
    }

    return docs;
}

module.exports =
{
    loaddocs,
    loadUserDocuments: loaddocs,
    expensetxte,
    debtext,
    grouptxt
};