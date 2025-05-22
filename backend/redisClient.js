const Redis = require('ioredis');

let redis = new Redis();

async function saveToRedis(key, value) {
    try {
        await ensureRedisClient();
        await redis.set(key, JSON.stringify(value)); // שמירה ב-Redis
        console.log('Saved to Redis');
    } catch (error) {
        console.error('Error saving to Redis:', error);
    }
}


async function loadFromRedis(key) {
    try {
        await ensureRedisClient();
        const value = await redis.get(key); // טעינה מ-Redis
        if (value) {
            // console.log('Loaded from Redis:', value);
            return JSON.parse(value);
        } else {
            console.log('No data found in Redis');
            return null;
        }
    } catch (error) {
        console.error('Error loading from Redis:', error);
        return null;
    }
}


async function ensureRedisClient() {
    if (!redis || redis.status !== 'ready') {
        console.log('Reconnecting to Redis...');
        redis = new Redis();
        redis.on('connect', () => {
            console.log('Reconnected to Redis');
        });
        redis.on('error', (err) => {
            console.error('Redis error:', err);
        });
    }
}
module.exports = { saveToRedis, loadFromRedis };
