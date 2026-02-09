const db = require("../db/queries");

async function viewFolderGet(req, res) {
    const loggedIn = req.isAuthenticated();

    if (!loggedIn) {
        res.send('<h1>You are not authorized to view this page</h1><br><a href="/">Back to home</a>')
    }

    const folderId = req.params.id;
    const userId = req.user.id;

    const folder = await db.getFolder(userId, folderId);
    if (!folder) {
        return res.status(404).send('Folder not found!');
    }

    res.render('folder', {
        f: folder
    });
}

module.exports = {
    viewFolderGet,
}