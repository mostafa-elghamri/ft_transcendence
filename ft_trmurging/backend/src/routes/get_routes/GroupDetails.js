const express = require('express');
const GroupDetails = express.Router();
const Auth = require("../../controllers/middleware");
const getGroupExpenses = require('../../utils/getGroupExpenses');

GroupDetails.get('/', Auth, async (req, res) => {
    const userId = req.session.userId;
    req.groupId = '6accfbad416c4259988ceb63';
    const groupDetails = await getGroupExpenses(req.groupId, userId);
    console.dir(groupDetails, { depth: null, colors: true });
    return res.render('Dashboard');
})

module.exports = GroupDetails;