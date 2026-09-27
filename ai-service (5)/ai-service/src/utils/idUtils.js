const { ObjectId } = require('mongodb');

const UNKNOWN_USER = 'unknown user';
const UNKNOWN_GROUP = 'unknown group';

function toId(id)
{
    if (!id)
        return null;

    if (id instanceof ObjectId)
        return id;

    return new ObjectId(id);
}

function tostr(id)
{
    return id.toString();
}

function makenames(users)
{
    const names = {};

    for (const u of users)
    {
        const idstring = tostr(u._id);
        names[idstring] = u.name;
    }

    return names;
}

function getnames(names, id)
{
    const idkey = tostr(id);

    if (names[idkey] !== undefined && names[idkey] !== null)
    {
        return names[idkey];
    }
    else
    {
        return UNKNOWN_USER;
    }
}

function makegroupnames(groups)
{
    const names = {};

    for (const g of groups)
    {
        const idstring = tostr(g._id);
        names[idstring] = g.name;
    }

    return names;
}

function getgroupname(names, id)
{
    const idkey = tostr(id);

    if (names[idkey] !== undefined && names[idkey] !== null)
    {
        return names[idkey];
    }
    else
    {
        return UNKNOWN_GROUP;
    }
}

module.exports =
{
    toId,
    tostr,
    makenames,
    getnames,
    makegroupnames,
    getgroupname,
    UNKNOWN_USER,
    UNKNOWN_GROUP
};