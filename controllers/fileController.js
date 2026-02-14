const { validationResult, body } = require("express-validator");
const path = require("path");
const streamifier = require("streamifier");
const prisma = require('../lib/prisma');
const cloudinary = require("../config/cloudinary");
const db = require("../db/queries");

const validateFileName = body('uploadFile').trim()
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('File must contain only letters, numbers, underscores, and dashes (-)!')
    .isLength({ min: 1, max: 45 }).withMessage('Folder must be between 1 and 45 characters long!');

const validateFileRename = body('renameFile').trim()
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('File must contain only letters, numbers, underscores, and dashes (-)!')
    .isLength({ min: 1, max: 45 }).withMessage('Folder must be between 1 and 45 characters long!');

async function uploadFilePost(req, res) {
    const errs = validationResult(req);
    const loggedIn = req.isAuthenticated();
    const slug = req.params.slug;

    if (!loggedIn) {
        return res.status(403).send('<h1>You do not have access to this link</h1><a href="/">Back to Home</a>');
    }

    if (!errs.isEmpty()) {
        req.session.formData = {
            activePopup: 'uploadFile',
            formErrors: errs.array(),
            formOld: req.body
        };

        // keeps session saved so the popup will remain on screen with any errors
        return req.session.save(() => {
            res.redirect(`/folder/${slug}`);
        });
    }

    if (!req.file) {
        req.session.formData = {
            activePopup: 'uploadFile',
            formErrors: [{ msg: 'No file uploaded' }],
            formOld: req.body
        };

        return req.session.save(() => {
            res.redirect(`/folder/${slug}`);
        });
    }

    if (!req.file.mimetype.startsWith('image/') && !req.file.mimetype.startsWith('application/pdf')) {
        req.session.formData = {
            activePopup: 'uploadFile',
            formErrors: [{ msg: 'File type must be image or PDF!' }],
            formOld: req.body
        };

        return req.session.save(() => {
            res.redirect(`/folder/${slug}`);
        });
    }

    try {
        const folderId = Number(slug.split('_')[0]);
        const folder = await db.getFolder(req.user.id, folderId);

        if (!folder) {
            req.session.formData = {
                activePopup: 'uploadFile',
                formErrors: [{ msg: 'Folder not found' }],
                formOld: req.body
            };

            return req.session.save(() => {
                res.redirect(`/folder/${slug}`);
            });
        }
        
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `users/${req.user.id}/folder_${folder.id}`,
                    resource_type: "auto"
                },
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        const fileExt = path.extname(req.file.originalname);
        const finalName = `${req.body.uploadFile}${fileExt}`;

        await db.createFile(req.user.id, folder.id, finalName, req.file.size, uploadResult.secure_url);

        res.redirect(`/folder/${slug}`);
    } catch (err) {
        console.log(err);
        req.session.formData = {
            activePopup: 'uploadFile',
            formErrors: [{ msg: 'Upload failed' }],
            formOld: req.body
        };

        return req.session.save(() => {
            res.redirect(`/folder/${slug}`);
        });
    }
}

module.exports = {
    uploadFilePost,
    validateFileName,
    validateFileRename,
}