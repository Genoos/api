const router = require("express").Router();

const Post = require("../models/post");
const User = require("../models/user");

// create a post
router.post("/", (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(400).json(err);
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json({ message: "Post updated successfully" });
    } else {
      res.status(401).json({ message: "unauthorized" });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});
// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json({ message: "post deleted" });
    } else {
      res.status(401).json({ message: "unauthorized" });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});
// like a post
// router.put("/like/:id", async (req, res) => {
//   try {
//     const post = Post.findById(req.params.id);
//     if (!post.likes.includes(req.body.userId)) {
//       post.likes.push(req.body.userId);
//       await post.save();
//       res.status(200).json({ message: "post liked" });
//     } else {
//       post.likes.pull(req.body.userId);
//       await post.save();
//       res.status(200).json({ message: "post unliked" });
//     }
//   } catch (err) {
//     res.status(400).json(err);
//   }
// });

// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(400).json(err);
  }
});
// get timeline of posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all users posts
router.get("/", async (req, res) => {
  const username = req.query.user;
  const catName = req.query.cat;
  try {
    let posts;
    if (username) {
      posts = await Post.find({ username });
    } else if (catName) {
      posts = await Post.find({
        categories: {
          $in: [catName],
        },
      });
    } else {
      posts = await Post.find();
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user's all posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
