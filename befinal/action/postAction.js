const Post = require('../schema/postSchema');
const User = require('../schema/userSchema');

const createPost = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Post content is required' });
        }

        const newPost = new Post({
            userId,
            content
        });

        await newPost.save();

        res.status(201).json({
            message: 'Post created successfully',
            postId: newPost._id
        });
    } catch (err) {
        console.error('Error in createPost:', err);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

// 🔹 Lấy tất cả post (hiển thị userName và avatar)
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('userId', 'userName profilePicture')
            .sort({ createdAt: -1 });

        const formattedPosts = posts.map(post => ({
            _id: post._id,
            content: post.content,
            createdAt: post.createdAt,
            user: {
                _id: post.userId._id,
                userName: post.userId.userName,
                profilePicture: post.userId.profilePicture[0] || null
            },
            likesCount: post.likes?.length || 0,
            commentsCount: post.comments?.length || 0
        }));

        res.status(200).json(formattedPosts);
    } catch (err) {
        console.error('Error in getAllPosts:', err);
        res.status(500).json({ error: 'Failed to retrieve posts' });
    }
};

// 🔹 Xóa post
const deletePost = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const postId = req.params.postId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error in deletePost:', err);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};
// 🔹 Edit post
const editPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id || req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (post.userId.toString() !== userId.toString())
            return res.status(403).json({ error: 'Not authorized' });

        post.content = content;
        await post.save();

        res.status(200).json({ message: 'Post updated successfully' });
    } catch (err) {
        console.error('editPost error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 🔹 Like post
const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id || req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (!post.likes.includes(userId)) {
            post.likes.push(userId);
            await post.save();
        }

        res.status(200).json({ message: 'Post liked' });
    } catch (err) {
        console.error('likePost error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 🔹 Unlike post
const unlikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id || req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        await post.save();

        res.status(200).json({ message: 'Post unliked' });
    } catch (err) {
        console.error('unlikePost error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 🔹 Add comment
const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id || req.user._id;
        const { text } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.comments.push({ userId, text });
        await post.save();

        res.status(200).json({ message: 'Comment added' });
    } catch (err) {
        console.error('addComment error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 🔹 Delete comment
const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user.id || req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        if (comment.userId.toString() !== userId.toString())
            return res.status(403).json({ error: 'Not authorized to delete this comment' });

        comment.remove();
        await post.save();

        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        console.error('deleteComment error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    editPost,
    likePost,
    unlikePost,
    addComment,
    deleteComment
};
