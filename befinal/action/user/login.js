const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../schema/userSchema');
const Calendar = require('../../schema/calendarSchema');  // Thêm dòng này để lấy Calendar

const secret = process.env.JWT_SECRET || 'your-secret-key';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Kiểm tra password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash); 
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Tạo token
        const token = jwt.sign(
            { id: user._id, email: user.email, userName: user.userName },
            secret,
            { expiresIn: '3h' }
        );

        // Tìm calendar của user
        const calendar = await Calendar.findOne({ userId: user._id });

        res.json({
            message: 'Login successful',
            token: token,
            userId: user._id,
            calendarId: calendar ? calendar._id : null
        });
    } catch (err) {
        console.error('login.js error 500: ', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = login;
