async function uploadFileGet(req, res) {
    const loggedIn = req.isAuthenticated();

    if (!loggedIn) {
        res.send('<h1>You do not have access to this link</h1><a href="/">Back to Home</a>')
    } else {
        res.render('upload-file');
    }
}

async function uploadFilePost(req, res) {
    console.log('File uploaded');
    res.redirect('/');
}

module.exports = {
    uploadFileGet,
    uploadFilePost,
}