
import multer from "multer";
import express from "express";



const app = express();
const port = 3000;

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'audio/midi' || file.mimetype === 'audio/x-midi') {
            cb(null, true);
        } else {
            cb(new Error('Only MIDI files are allowed'));
        }
    }
});

// Upload route
app.post('/upload', upload.single('filename'), (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded or an error occurred.');
    } else {
        res.send(`The file ${req.file.originalname} has been uploaded.`);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
