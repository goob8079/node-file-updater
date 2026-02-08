const streamifier = require("streamifier");
const prisma = require('../lib/prisma');
const cloudinary = require("../config/cloudinary");
const db = require("../db/queries");


async function uploadFileGet(req, res) {
    const loggedIn = req.isAuthenticated();

    if (!loggedIn) {
        res.send('<h1>You do not have access to this link</h1><a href="/">Back to Home</a>')
    } else {
        res.render('upload-file');
    }
}

async function uploadFilePost(req, res) {
    const loggedIn = req.isAuthenticated();

    if (!loggedIn) {
        return res.status(403).send('<h1>You do not have access to this link</h1><a href="/">Back to Home</a>');
    } 

    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }

    try {
        // get root folder
        const rootFolder = await prisma.folder.findFirst({
            where: {
                ownerId: req.user.id,
                parentId: null
            }
        });

        if (!rootFolder) {
            return res.staus(500).send("Root folder not found");
        }
        
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `users/${req.user.id}/folder_${rootFolder.id}`,
                    resource_type: "auto"
                },
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        await db.createFile(req.user.id, rootFolder.id, req.file.originalname, req.file.size, uploadResult.secure_url);

        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).send("Upload failed")
    }
}

module.exports = {
    uploadFileGet,
    uploadFilePost,
}