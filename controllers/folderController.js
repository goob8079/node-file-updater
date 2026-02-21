const { validationResult, body } = require("express-validator");
const db = require("../db/queries");

const validateFolderName = body('newFolderName').trim()
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Folder must contain only letters, numbers, underscores, and dashes (-)!')
    .isLength({ min: 1, max: 45 }).withMessage('Folder must be between 1 and 45 characters long!');

const validateFolderRename = body('renameFolder').trim()
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Folder must contain only letters, numbers, underscores, and dashes (-)!')
    .isLength({ min: 1, max: 45 }).withMessage('Folder must be between 1 and 45 characters long!');

async function viewFolderGet(req, res) {
    const loggedIn = req.isAuthenticated();
    const slug = req.params.slug

    if (!loggedIn) {
        res.send('<h1>You are not authorized to view this page</h1><br><a href="/">Back to home</a>')
    }

    // to retrieve the id before the name (or underscores)
    const folderId = slug.split('_')[0];
    const userId = req.user.id;

    const folder = await db.getFolder(userId, folderId);
    if (!folder) {
        return res.status(404).send('Folder not found!');
    }

    // data from either creating or renaming a file (meant for errors and popup management)
    const formData = req.session.formData || {};
    // clear session after reading
    req.session.formData = null;

    res.render('folder', {
        f: folder,
        formErrors: formData.formErrors || [],
        formOld: formData.formOld || '',
        activePopup: formData.activePopup || null,
        shareLink: formData.shareLink
    });
}

async function createFolderPost(req, res) {
    const errs = validationResult(req);
    const slug = req.params.slug;
    const folderId = slug.split('_')[0];
    const userId = req.user.id;
    const folderName = req.body.newFolderName;

    // save formData into session to maintain errors and popup status (activePopup)
    if (!errs.isEmpty()) {
        req.session.formData = {
            activePopup: 'createFolder',
            formErrors: errs.array(),
            formOld: req.body
        };

        // keeps session saved so the popup will remain on screen with any errors
        return req.session.save(() => {
            res.redirect(`/folder/${slug}`);
        });
    }

    await db.createFolder(userId, folderId, folderName);
    res.redirect(`/folder/${slug}`);
}

async function renameFolderPost(req, res) {
    const errs = validationResult(req);
    const slug = req.params.slug;
    const folderId = slug.split('_')[0];
    const userId = req.user.id;

    if (!errs.isEmpty()) {
        req.session.formData = {
            activePopup: 'renameFolder',
            formErrors: errs.array(),
            formOld: req.body
        };

        // keeps session saved so the popup will remain on screen with any errors
        return req.session.save(() => {
            res.redirect(`/folder/${slug}`);
        });
    }

    await db.renameFolder(folderId, userId, req.body.renameFolder);
    res.redirect(`/folder/${slug}`);
}

async function deleteFolderPost(req, res) {
    const slug = req.params.slug;
    const folderId = slug.split('_')[0];
    const userId = req.user.id;
 
    if (req.body.deleteAction === 'noDeleteFolder') {
        return res.redirect(`/folder/${slug}`);
    }

    // if yesDelete is pressed
    await db.deleteFolder(folderId, userId);
    res.redirect('/');
}

async function sharedFolderGet(req, res) {
    const { id } = req.params;

    const shareLink = await db.getSharedLink(id)

    if (!shareLink) {
        return res.status(404).render('404');
    }

    // Expiration check
    if (shareLink.expires < new Date()) {
        return res.status(403).send("This link has expired.");
    }

    res.render('shared-folder', {
        folder: shareLink.folder,
        files: shareLink.folder.files,
        expires: shareLink.expires
    });
}

async function sharedFolderPost(req, res) {
    const slug = req.params.slug;
    const userId = req.user.id;

    try {
        const folderId = slug.split('_')[0];

        const folder = await db.getFolder(userId, folderId);
        if (!folder) {
            return res.redirect('/');
        }

        const shareLink = await db.createSharedLink(folderId, userId);
        console.log(shareLink);
        
        req.session.formData = {
            activePopup: 'shareLink',
            shareLink: shareLink
        }

        return req.session.save(() => {
            res.redirect(`/folder/${slug}`);
        });
    } catch (err) {
        console.error(err);
        res.redirect(`/folder/${slug}`);
    }
}

module.exports = {
    viewFolderGet,
    createFolderPost,
    renameFolderPost,
    deleteFolderPost,
    sharedFolderGet,
    sharedFolderPost,
    validateFolderName,
    validateFolderRename,
}