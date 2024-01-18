const express = require("express");
const { createPost,updatePost,deletePost,getPosts } = require("../controllers/post.controller");
const authenticate = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/create", authenticate, createPost);
router.put('/update/:postId', authenticate, updatePost)
router.delete('/delete/:postId', authenticate,deletePost)
router.get('/',authenticate,getPosts)
module.exports = router;
