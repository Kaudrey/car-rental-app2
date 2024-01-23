const Post = require("../models/post.model");
const { Pool } = require('pg');
const { Op } = require('sequelize');
const {
    createSuccessResponse,
    errorResponse,
    serverErrorResponse,
} = require("../utils/api.response");

exports.createPost = async (req, res) => {
    try {
        const userId = req.user._id;
        let createPostResult= await Pool.query(
            'INSERT INTO posts(userId,title, description, fileUrl) VALUES($1, $2, $3) RETURNING *',
            [userId,req.body.title,req.body.description,req.body.fileUrl]
        ) ;
        let post = createPostResult.rows[0];

        await post.save();

        return createSuccessResponse("Post created successfully", {}, res);
    } catch (ex) {
        return serverErrorResponse(ex, res);
    }
};
exports.updatePost = async (req, res) =>{
    try {
        
        const { postId } = req.params;
        const { title, description, fileUrl } = req.body;
        const existingPost = await Post.findById(postId);

        if (!existingPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (existingPost.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Permission denied. You are not the creator of this post." });
        }
        const updatedPost = await Post.findByIdAndUpdate(
            
          postId,
          { title, description, fileUrl },
          { new: true }
        );
    
        if (!updatedPost) {
          return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(updatedPost);
    }catch (ex) {
        return serverErrorResponse(ex, res);
    }
}

exports.deletePost = async (req, res) => {
    try {
      const { postId } = req.params;

      const existingPost = await Post.findById(postId);

      if (!existingPost) {
          return res.status(404).json({ message: "Post not found" });
      }
      if (existingPost.userId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: "Permission denied. You are not the creator of this post." });
      }
  
      const post = await Post.findById(postId);
      await post.deleteOne();
  
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting post" });
    }
  };
  exports.getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }, 
        };

        const paginatedPosts = await Post.paginate({}, options);

        const modifiedPosts = paginatedPosts.docs.map(post => ({
            userId: post.userId,
            title: post.title,
            description: post.description,
            createdAt:post.createdAt
        }));

        return createSuccessResponse("Posts retrieved successfully", {
            ...paginatedPosts,
            docs: modifiedPosts,
        }, res);
    } catch (ex) {
        return serverErrorResponse(ex, res);
    }
};
