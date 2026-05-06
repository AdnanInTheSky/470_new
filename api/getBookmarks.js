const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const DB_NAME = 'edtech';

let cachedDb = null;

async function connectDB() {
    if (cachedDb) return cachedDb;
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);
    cachedDb = db;
    return db;
}

function verifyToken(req) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return null;
    try {
        return jwt.verify(header.split(' ')[1], JWT_SECRET);
    } catch {
        return null;
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

        const db = await connectDB();
        const users = db.collection('users');

        const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
        if (!user) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json({ bookmarks: user.bookmarks || [] });
    } catch (error) {
        console.error('GetBookmarks error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};