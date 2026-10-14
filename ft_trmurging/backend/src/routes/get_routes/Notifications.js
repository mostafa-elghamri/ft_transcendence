const express = require('express');
const Auth = require('../../controllers/middleware.js');
const printLogsDate = require('../../utils/printLogs.js');

const Notifications = express.Router();

Notifications.get('/', Auth, (req, res) => {
    if(!req.cookies.has_visited)
    {
        req.cookies('has_visited', 'true', {maxAge: 365 * 424 * 60 * 60 * 1000});
        res.render(`signup`);
    }
    else
        res.render('Notifications');
    const userId = req.session.userId;
    printLogsDate(`User with Id ${userId} viewed Notifications list at : `);
});

module.exports = Notifications;