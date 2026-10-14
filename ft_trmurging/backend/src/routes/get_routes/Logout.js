const express = require('express');
const Logout = express.Router();
const Auth = require('../../controllers/middleware');

Logout.get('/', Auth, (req,  res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).sne ('Error Logging out');
        }
        res.clearCookie('connect.sid');

        res.redirect('/login');
    })
});

module.exports = Logout;