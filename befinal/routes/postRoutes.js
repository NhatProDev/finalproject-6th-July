const express = require('express');
const router = express.Router();
const postAction = require('../action/postAction');
const { verifyToken } = require('../middlewares/auth');

// Post CRUD
router.post('/', verifyToken, postAction.createPost);
router.get('/', postAction.getAllPosts);
router.put('/:postId', verifyToken, postAction.editPost);
router.delete('/:postId', verifyToken, postAction.deletePost);

// Post Like / Unlike
router.post('/:postId/like', verifyToken, postAction.likePost);
router.post('/:postId/unlike', verifyToken, postAction.unlikePost);

// Post Comment
router.post('/:postId/comment', verifyToken, postAction.addComment);
router.delete('/:postId/comment/:commentId', verifyToken, postAction.deleteComment);

module.exports = router;
