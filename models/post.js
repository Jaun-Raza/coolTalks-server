import mongoose from "mongoose"

const postSchema = mongoose.Schema({
    postId: {
        type: String,
        required: true
    },
    userImg: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    postImg: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    comments: [{}],
    date: {
        type: String
    }
})

const Post = mongoose.model('posts', postSchema);

export default Post;