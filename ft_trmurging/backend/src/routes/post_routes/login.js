const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/Schemas/User.js');
const printLogsDate = require('../../utils/printLogs.js');

const PLogin = express.Router();

PLogin.post(`/`, async (req, res) => {
    // console.log("Received login data :", req.body);
    const {email, password} = req.body;
    if (!email || !password)
        return res.status(400).send(`Email and Password are required!`);
    const user = await User.findOne({ email });
    if (!user)
        return res.status(404).send(`Invalid credentials . please try again !`);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch)
        return res.status(401).send(`Invalid credentials . please try again !`);
    req.session.userId = user._id;
    req.session.username = user.fullName;
    const userId = req.session.userId;
    console.log(req.session.userId);
    printLogsDate(`User with Id ${userId} Logged in at : `);
    return res.redirect(`Dashboard`);
});

// PLogin.post('/', async (req, res) => {
//     const { email, password } = req.body;

//     // ✅ Validate inputs FIRST
//     if (!email || !password) {
//         return res.status(400).send("Email and password are required.");
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//         return res.status(401).send("Invalid email or password");
//     }

//     // ✅ Now safe to compare — both values are guaranteed to exist
//     const isMatch = await bcrypt.compare(password, user.password);
    
//     if (!isMatch) {
//         return res.status(401).send("Invalid email or password");
//     }

//     // Success...
// });

module.exports = PLogin;