const mongoose = require('mongoose');
const ApiLog = require('./src/models/ApiLog');
const User = require('./src/models/User');
const crypto = require('crypto');
require('dotenv').config();

async function testTrafficHistory() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Create test user
    let user = await User.findOne({ username: 'testuser_traffic' });
    if (!user) {
        user = await User.create({
            username: 'testuser_traffic',
            email: 'traffic@test.com',
            passwordHash: 'pass',
            apiKey: crypto.randomBytes(16).toString('hex'),
            role: 'user',
            accountType: 'SAVINGS'
        });
    }

    // Create test logs distributed across 24 hours
    const now = new Date();
    const logs = [];

    for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000);
        const count = Math.floor(Math.random() * 100) + 50; // 50-150 requests per hour

        for (let j = 0; j < count; j++) {
            logs.push({
                userId: user._id,
                endpoint: '/api/balance',
                method: 'GET',
                statusCode: Math.random() > 0.9 ? 429 : 200, // 10% blocked
                ipAddress: '192.168.1.100',
                isBlocked: Math.random() > 0.9,
                accountType: 'SAVINGS',
                riskScore: Math.floor(Math.random() * 100),
                riskLevel: 'LOW',
                createdAt: new Date(timestamp.getTime() + Math.random() * 60 * 60 * 1000)
            });
        }
    }

    await ApiLog.deleteMany({ userId: user._id });
    await ApiLog.insertMany(logs);

    console.log(`✓ Created ${logs.length} test logs across 24 hours\n`);

    // Test the aggregation query (same as endpoint)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const trafficAgg = await ApiLog.aggregate([
        { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
        {
            $group: {
                _id: { hour: { $hour: "$createdAt" } },
                total: { $sum: 1 },
                blocked: {
                    $sum: {
                        $cond: [{ $or: [{ $eq: ["$isBlocked", true] }, { $eq: ["$statusCode", 429] }] }, 1, 0]
                    }
                }
            }
        },
        { $sort: { "_id.hour": 1 } }
    ]);

    console.log('=== Traffic History Data (as returned by endpoint) ===\n');

    // Create time buckets
    const buckets = [];
    for (let i = 0; i < 24; i += 4) {
        const hour = (now.getHours() - (24 - i) + 24) % 24;
        const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

        const hourData = trafficAgg.filter(item =>
            item._id.hour >= hour && item._id.hour < (hour + 4)
        );

        const total = hourData.reduce((sum, item) => sum + item.total, 0);
        const blocked = hourData.reduce((sum, item) => sum + item.blocked, 0);

        buckets.push({ time: timeLabel, total, blocked });
    }

    buckets.forEach(bucket => {
        const blockPct = bucket.total > 0 ? ((bucket.blocked / bucket.total) * 100).toFixed(1) : 0;
        console.log(`${bucket.time} → Total: ${bucket.total.toString().padStart(4)}, Blocked: ${bucket.blocked.toString().padStart(3)} (${blockPct}%)`);
    });

    console.log('\n✅ Traffic history endpoint will return this data!');
    console.log('The AdminDashboard chart will display these values.');

    process.exit(0);
}

testTrafficHistory().catch(e => { console.error(e); process.exit(1); });
