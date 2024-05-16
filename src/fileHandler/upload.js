"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var multer_1 = require("multer");
var express_1 = require("express");
var app = (0, express_1.default)();
var port = 3000;
// Multer configuration
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'audio/midi' || file.mimetype === 'audio/x-midi') {
            cb(null, true);
        }
        else {
            cb(new Error('Only MIDI files are allowed'));
        }
    }
});
// Upload route
app.post('/upload', upload.single('filename'), function (req, res) {
    if (!req.file) {
        res.status(400).send('No file uploaded or an error occurred.');
    }
    else {
        res.send("The file ".concat(req.file.originalname, " has been uploaded."));
    }
});
// Start the server
app.listen(port, function () {
    console.log("Server is listening on port ".concat(port));
});
