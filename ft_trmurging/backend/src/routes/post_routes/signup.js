const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/Schemas/User.js');
const printLogsDate = require('../../utils/printLogs.js');

const PSignup = express.Router();

PSignup.post('/', async (req, res) => {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
        username: req.body.fullName,
        email: req.body.email,
        password: hashedPass,
        // _id: req.sessionID,
    });
    try{
        console.log('user is being saved');
        await newUser.save();
        const userId = req.session.userId;
        console.log("current user id is : ", userId);
        console.log("new user id is : ", newUser._id);
        printLogsDate(`User with Id ${userId} Signed in at : `);
    }
    catch(error){
        console.log(error.message);
        if (error.code == 11000)
            res.send("This email is already registered. please use another one instead!");
        else
            console.log("An error occurred while saving the user");
    }
    console.log("Received signup data :", req.body);
    return res.redirect(`Dashboard`);
});

module.exports = PSignup;