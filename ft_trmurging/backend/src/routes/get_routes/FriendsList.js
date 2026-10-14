const express = require('express');
const Auth = require('../../controllers/middleware.js');
const printLogsDate = require('../../utils/printLogs.js');

const Friends = express.Router();

Friends.get('/', Auth, (req, res) => {
    const userId = req.session.userId;
    printLogsDate(`User with Id ${userId} viewed Friends list at : `);
    if (!req.cookies.has_visited)
    {
        req.cookies('has_visited', 'true', {maxAge: 365 * 24 * 60 * 60 * 1000});
        res.render(`signup`);
    }
    else
        res.render('Friends');
});

module.exports = Friends;