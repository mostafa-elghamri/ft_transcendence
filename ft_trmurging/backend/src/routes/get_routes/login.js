const express = require('express');

const Login = express.Router();

Login.get(`/`, (req, res) => {
    res.render('signup');
});

module.exports = Login;