const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    text: { type: String, required: true },
    image: { type: String, required: true},
    user: { type: String, required: true },
    imageStr : { data: Buffer, contentType:String }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;