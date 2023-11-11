import mongoose from "mongoose"

const UserSchema = mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    post: [{}],
    date: {
        type: String
    }
})

const User = mongoose.model('users', UserSchema);

export default User;