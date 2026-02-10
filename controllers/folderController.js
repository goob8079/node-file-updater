const { validationResult, body } = require("express-validator");
const db = require("../db/queries");

const validateFolderName = body('renameFolder').trim()
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Folder must contain only letters and numbers!')
    .isLength({ min: 1, max: 45 }).withMessage('Folder must be between 1 and 45 characters long!');

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
        f: folder,
        errors: [],
        old: ''
    });
}

async function renameFolderPost(req, res) {
    const errs = validationResult(req);
    const folderId = req.params.id;
    const userId = req.user.id;

    if (!errs.isEmpty()) {
        const folder = await db.getFolder(userId, folderId);
        return res.status(400).render('folder', {
            f: folder,
            errors: errs.array(),
            old: req.body.renameFolder
        });
    }

    await db.renameFolder(folderId, userId, req.body.renameFolder);
    res.redirect(`/folder/${folderId}`);
}

async function deleteFolderPost(req, res) {

}

module.exports = {
    viewFolderGet,
    renameFolderPost,
    validateFolderName,
}