const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'edtech';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);
    cachedDb = db;
    return db;
}

function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Verify token
        const decoded = verifyToken(req);
        if (!decoded) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const { slug } = req.body;
        if (!slug) {
            return res.status(400).json({ error: 'Course slug is required' });
        }
        
        const db = await connectToDatabase();
        const users = db.collection('users');
        
        // Find user
        const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if already bookmarked
        const bookmarks = user.bookmarks || [];
        const index = bookmarks.indexOf(slug);
        
        if (index > -1) {
            // Remove bookmark
            bookmarks.splice(index, 1);
            await users.updateOne(
                { _id: new ObjectId(decoded.userId) },
                { $set: { bookmarks } }
            );
            return res.status(200).json({ message: 'Bookmark removed', action: 'removed' });
        } else {
            // Add bookmark
            bookmarks.push(slug);
            await users.updateOne(
                { _id: new ObjectId(decoded.userId) },
                { $set: { bookmarks } }
            );
            return res.status(200).json({ message: 'Bookmark added', action: 'added' });
        }
    } catch (error) {
        console.error('Bookmark error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};