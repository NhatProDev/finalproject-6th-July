const express = require('express');
const router = express.Router();
const userAction = require('../action/user/userAction');
const login = require('../action/user/login');
const { verifyToken } = require('../middlewares/auth');

// 🔐 Authenticated routes sẽ cần verifyToken

// User routes
router.get('/', userAction.getAllUsers);         // Get all users
router.post('/', userAction.createUser);         // Register new user
router.get('/:id', userAction.getUserbyID);      // Get user by ID
router.put('/:id', userAction.userUpdate);       // Update user profile
router.delete('/:id', userAction.deleteUser);    // Delete user

// Auth & Login
router.post('/login', login);                    // User login

// 👥 Friend system
router.post('/friends/request/:receiverId', verifyToken, userAction.sendFriendRequest);         // Send friend request
router.post('/friends/accept/:senderId', verifyToken, userAction.acceptFriendRequest);         // Accept friend request
router.post('/friends/reject/:senderId', verifyToken, userAction.rejectFriendRequest);         // Reject friend request
router.delete('/friends/unfriend/:friendId', verifyToken, userAction.unfriend);                // Unfriend user
router.get('/friends/list', verifyToken, userAction.getFriends);                               // Get all friends
router.get('/friends/requests', verifyToken, userAction.getFriendRequests);                    // Get all friend requests

module.exports = router;
