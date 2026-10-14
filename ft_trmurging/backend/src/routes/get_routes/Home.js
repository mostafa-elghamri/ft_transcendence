const express = require('express');
const Auth = require('../../controllers/middleware');
const getUserBalance = require('../../utils/calculateUserBalance');
const Home = express.Router();

Home.get('/', Auth, async (req, res) => {
    const userId = req.session.userId;
    console.log(userId);
    const formattedGroups = await getUserBalance(userId);
    console.log("this is the current user's balance : ");
    console.dir(formattedGroups, {depth: null, colors: true});
    if (!req.cookies.has_visited)
    {
        res.cookie('has_visited', "true", {maxAge: 365 * 24 * 60 * 60 * 1000});
        res.render(`signup`);
    }
    else
        res.send({formattedGroups});
})

module.exports = Home;