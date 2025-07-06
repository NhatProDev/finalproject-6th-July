const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'your-secret-key';

const verifyToken = (req, res, next) =>{
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: 'Missing or invalid token'})
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }catch(err){        
        console.log('Error on auth.js: ', err)
        return res.status(403).json({message: 'Token is invalid or expired'});
    }
};

module.exports = { verifyToken };
