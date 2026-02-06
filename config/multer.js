const path = require("path");
const multer = require('multer');

// diskStorage setup for multer to save files directly within the repository for now
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/data')
    },
    filename:  (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

module.exports = upload;