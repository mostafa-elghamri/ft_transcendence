const express = require('express');

const Signup = express.Router();

Signup.get(`/`, (req, res) => {
    // console.log("sdff");
    res.render(`signup`);
});

module.exports = Signup;