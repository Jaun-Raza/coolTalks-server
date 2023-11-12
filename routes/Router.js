import express from "express";
import bcrypt from 'bcrypt'


// All Schema's
import Post from '../models/post.js';
import User from '../models/user.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World!');
})


router.get('/foryou', (req, res) => {
    Post.find({}).then((foundPosts) => {
        const page = req.query.page || 1;
      const pageSize = 100; // Adjust as needed
      const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

  const paginatedPosts = foundPosts.slice(startIndex, endIndex);
        
        res.status(200).json({ foundPosts: paginatedPosts, success: true });
    }).catch(err => {
        res.status(400).json({ err, success: false });
    })
})

router.post('/addPost', (req, res) => {
    const { profilePic, username, image, text, email } = req.body;

    const randomNum = Math.random() * 4

    const currentDate = new Date();

    // Adjust for Pakistan Standard Time (UTC+5)
    const pstOffset = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
    const pstDate = new Date(currentDate.getTime() + pstOffset);

    // Extract the components of the date and time
    const year = pstDate.getFullYear();
    const month = pstDate.getMonth() + 1; // Months are 0-based, so add 1
    const day = pstDate.getDate();
    const hours = pstDate.getHours();
    const minutes = pstDate.getMinutes();
    const seconds = pstDate.getSeconds();

    // Format the date and time in the "YYYY-MM-DD HH:MM:SS" format
    const formattedDateTime = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const newPost = new Post({
        postId: randomNum,
        userImg: profilePic,
        username: username,
        postImg: image,
        content: text,
        date: formattedDateTime
    })

    newPost.save()

    User.findOne({ email: email }).then((foundUser) => {
        foundUser.post.push(newPost)
        foundUser.save()
    })

})

router.post('/api/posts/like', async (req, res) => {
    const { postId, liked } = req.body;

    // Find the post by ID
    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Update the likes count based on the 'liked' parameter
        if (liked) {
            post.likesCount += 1;
        } else {
            post.likesCount -= 1;
        }

        // Save the updated post
        await post.save();

        return res.json({ message: 'Like status updated', likesCount: post.likesCount });
    } catch (error) {
        console.error('Error liking/unliking the post:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.get('/posts/:id', (req, res) => {
    let id = req.params.id;
    Post.findOne({ _id: id }).then((foundPosts) => {
        res.status(200).json({ foundPosts, success: true });
    }).catch(err => {
        res.status(400).json({ err, success: false });
    })
})

router.post('/posts/comment', (req, res) => {
    let { post_id, commentId, username, userImg, comment } = req.body;
    Post.findOne({ _id: post_id }).then((foundPosts) => {

        const newComment = {
            commentId: commentId,
            userImg: userImg,
            username: username,
            comment: comment
        }

        foundPosts.comments.push(newComment);
        foundPosts.save().then(() => {
            res.status(200).json({ success: true })
        }).catch(err => {
            res.status(200).json({ success: false })
        })
    })

})

router.post('/posts/delete', (req, res) => {
    let { commentId, postId, userName, checkName } = req.body;
    Post.findOne({ _id: postId }).then((foundPosts) => {
        const foundComment = foundPosts.comments.find((foundComment) => {
            return foundComment.username === userName
        })
        if (foundComment.username === checkName) {
            const remainingComments = foundPosts.comments.filter((foundComment) => {
                return foundComment.commentId !== commentId
            })

            foundPosts.comments = remainingComments;
            foundPosts.save()
        }
    })
})

router.post('/signup', async (req, res) => {
    const { image, username, email, password } = req.body;

    const saltRounds = await bcrypt.genSalt(10);
    const setPassword = await bcrypt.hash(password, saltRounds)
    const findUser = await User.findOne({ email: email });
    const findUserNames = await User.findOne({ username: username })

    const newUser = new User({
        image,
        username,
        email,
        password: setPassword
    })

    if (findUserNames) {
        return res.json({ success: false, message: 'Username already exists' });
    }

    if (findUser) {
        return res.json({ success: false, message: 'Email is already in use' });
    }

    newUser.save().then((foundUser) => {
        res.status(200).json({ foundUser, success: true });
    }).catch(err => {
        console.log(err);
        res.status(403).json({ success: false });
    })

})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email: email });

    if (findUser) {
        const match = await bcrypt.compare(password, findUser.password);

        if (!match) {
            return res.status(400).json({ success: false, message: "Incorrect Password" });
        }
        return res.status(200).json({ findUser, success: true });
    } else {
        return res.status(400).json({ success: false, message: 'No Account Found' });
    }

})

router.post('/userData', (req, res) => {

    const { email } = req.body;

    User.findOne({ email: email }).then((foundUser) => {
        res.status(200).json({ foundUser });
    })
})

router.get('/userinfo/:username', (req, res) => {

    const username = req.params.username;

    User.findOne({ username: username }).then((foundUser) => {
        console.log(foundUser)
        res.status(200).json({ foundUser });
    })
})

router.post('/deletePost', async(req, res) => {
   try {
    let { postId, userName, checkName } = req.body;
    if(userName) {
        await Post.find({ postId: postId }).then((foundPosts) => {
            if (foundPosts[0].username === checkName) {
                Post.deleteOne({postId: postId}).then(() => {
                    console.log('deletePost');
                })
                
                User.findOne({ username: userName }).then((foundUser) => {
                    const remainingPosts = foundUser.post.filter((founduser) => {
                        return founduser.postId !== postId
                    })
            
                    foundUser.post = remainingPosts;
                    foundUser.save().then(() => {
                        console.log('deleteUser');
                    })
                })
            }
        })
    
    }
   } catch (error) {
    console.log(error);
   }
})


export default router;
