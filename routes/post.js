const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const Post = require('../models/post.js');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, try again later.'
});

router.use(limiter);

// get
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts.map(p => ({
            id: p._id,
            text: p.text,
            user: p.user,
            contentType: p.imageStr.contentType,
            base64: p.imageStr.data.toString("base64")
        })));
    }
    catch (err) {
        res.status(500).json({ error: 'Unable to fetch posts'});
    }
});

module.exports = router;