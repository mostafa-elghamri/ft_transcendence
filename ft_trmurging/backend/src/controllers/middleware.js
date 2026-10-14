function Auth(req, res, next) {
    // const date = new Date();
    // const currentTime = date.toLocaleDateString();
    // process.stdout.write("user attempted getting at : ")
    // console.log(currentTime);
    // // console.log("ggg");
    // console.log(req.session.userId);
    if (!req.session?.userId)
    {
        console.log("new user");
        return res.redirect(`/signup`);
    }
    return next();
}

module.exports = Auth;