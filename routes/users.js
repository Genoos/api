const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Post = require("../models/post");

//UPDATE USER
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Error updating user" });
    }
  } else {
    res
      .status(401)
      .json({ message: "You are not authorized to update this user" });
  }
});

//DELETE USER
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedUser);
      } catch (err) {
        res.status(500).json({ message: "Error deleting user" });
      }
    } catch (err) {
      res.status(404).json({ message: "User not found" });
    }
  } else {
    res
      .status(401)
      .json({ message: "You are not authorized to delete this user" });
  }
});

//GET USER
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//FOLLOW A USER
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        res.status(200).json({ message: "User followed" });
      } else {
        res.status(403).json({ message: "you already follow this user" });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json({ message: "You cannot follow yourself" });
  }
});

//UNFOLLOW A USER
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        res.status(200).json({ message: "User unfollowed" });
      } else {
        res.status(403).json({ message: "you don't follow this user" });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json({ message: "You cannot unfollow yourself" });
  }
});

module.exports = router;
