const db = require("../db/queries");

async function homepageGet(req, res) {
    const loggedIn = req.isAuthenticated();
    let folders = [];
    
    if (loggedIn) {
        folders = await db.getAllFolders(req.user.id);
    }

    res.render('index', {
        loggedIn: loggedIn,
        user: req.user?.username ?? null,
        folders: folders
    });
}

module.exports = {
    homepageGet,
}