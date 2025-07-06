// routes/testRoutes.js
const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../middlewares/auth'); // middleware của bạn

router.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({ message: `Hello ${req.user.userName}, your token works!` });
});

module.exports = router;

// This code defines a test route that requires JWT authentication.
// When a GET request is made to '/protected', it checks the token using the verifyToken middleware.