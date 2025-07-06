const crypto = require('crypto');
require('dotenv').config();

const algorithm = 'aes-256-cbc';
const rawKey = process.env.CRYPTO_KEY?.trim();

if (!rawKey || rawKey.length !== 64) {
    console.error("❌ CRYPTO_KEY must be 64 hex characters (32 bytes)");
    process.exit(1);
}

const key = Buffer.from(rawKey, 'hex');

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, null, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };
