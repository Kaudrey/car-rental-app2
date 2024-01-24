const { Pool } = require('pg');
const {
    createSuccessResponse,
    errorResponse,
    serverErrorResponse,
} = require("../utils/api.response");

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

exports.createPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title, description, fileUrl } = req.body;

        const createPostQuery = `
            INSERT INTO posts (userId, title, description, fileUrl)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const createPostValues = [userId, title, description, fileUrl];

        const createPostResult = await pool.query(createPostQuery, createPostValues);
        const post = createPostResult.rows[0];

        return createSuccessResponse("Post created successfully", {}, res);
    } catch (ex) {
        return serverErrorResponse(ex, res);
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, description, fileUrl } = req.body;
        const checkPostQuery = `
            SELECT * FROM posts WHERE id = $1 AND userId = $2;
        `;
        const checkPostValues = [postId, req.user._id];
        const existingPostResult = await pool.query(checkPostQuery, checkPostValues);
        const existingPost = existingPostResult.rows[0];

        if (!existingPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        const updatePostQuery = `
            UPDATE posts
            SET title = $1, description = $2, fileurl = $3
            WHERE id = $4
            RETURNING *;
        `;
        const updatePostValues = [title, description, fileUrl, postId];
        const updatedPostResult = await pool.query(updatePostQuery, updatePostValues);
        const updatedPost = updatedPostResult.rows[0];

        res.status(200).json(updatedPost);
    } catch (ex) {
        return serverErrorResponse(ex, res);
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const checkPostQuery = `
            SELECT * FROM posts WHERE id = $1 AND userId = $2;
        `;
        const checkPostValues = [postId, req.user._id];
        const existingPostResult = await pool.query(checkPostQuery, checkPostValues);
        const existingPost = existingPostResult.rows[0];

        if (!existingPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        const deletePostQuery = `
            DELETE FROM posts WHERE id = $1;
        `;
        const deletePostValues = [postId];

        await pool.query(deletePostQuery, deletePostValues);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (ex) {
        return serverErrorResponse(ex, res);
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const getPostsQuery = `
            SELECT * FROM posts
            ORDER BY createdAt DESC
            OFFSET $1 LIMIT $2;
        `;
        const offset = (page - 1) * limit;
        const getPostsValues = [offset, limit];

        const paginatedPostsResult = await pool.query(getPostsQuery, getPostsValues);
        const paginatedPosts = paginatedPostsResult.rows;

        const modifiedPosts = paginatedPosts.map(post => ({
            userId: post.userId,
            title: post.title,
            description: post.description,
            createdAt: post.createdAt,
        }));

        return createSuccessResponse("Posts retrieved successfully", {
            docs: modifiedPosts,
        }, res);
    } catch (ex) {
        return serverErrorResponse(ex, res);
    }
};
