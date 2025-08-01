const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) =>
        console.error("MongoDB connection error:", err));

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cookieParser());
app.use(cors(
    { 
        origin: 'http://localhost:5173',
        credentials: true
    }
));
app.use(express.json());

// Multer
const multer = require('multer');
const Post = require('./models/post.js');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage : storage });

app.post('/upload', upload.single('file'), async(req, res) => {
    const data = JSON.parse(req.body.post);
    console.log(req.file)
    res.json({message: "success"});
    const filePath = req.file.path;
    const post = new Post({
        text: data.text,
        image: `/uploads/${req.file.originalname}`,
        user: data.user,
        imageStr:{
            data: fs.readFileSync(filePath),
            contentType: req.file.mimetype
        }
    });

    const savedPost = await post.save()
    .then ((err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(savedPost);
        }
    });
});

// posts
const postRoutes = require('./routes/post.js');
app.use('/auth/posts', postRoutes);

const authRoutes = require('./routes/auth.js');
app.use('/auth', authRoutes);

app.listen(4000, () => {
    console.log('REST API running at http://localhost:4000');
});