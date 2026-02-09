const mongoose = require('mongoose');
const ApiLog = require('./src/models/ApiLog');
const User = require('./src/models/User');
const crypto = require('crypto');
require('dotenv').config();

async function verify() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Get or create test user
    let user = await User.findOne({ username: 'testuser_risk_verify' });
    if (!user) {
        user = await User.create({
            username: 'testuser_risk_verify',
            email: 'verify@test.com',
            passwordHash: 'pass',
            apiKey: crypto.randomBytes(16).toString('hex'),
            role: 'user',
            accountType: 'SAVINGS'
        });
    }

    await ApiLog.deleteMany({ userId: user._id });

    // Insert test logs
    await ApiLog.insertMany([
        { userId: user._id, endpoint: '/api/transfer', method: 'POST', statusCode: 400, ipAddress: '1.1.1.1', accountType: 'SAVINGS', riskScore: 45, riskLevel: 'MEDIUM', riskFactors: [] },
        { userId: user._id, endpoint: '/api/balance', method: 'GET', statusCode: 429, ipAddress: '1.1.1.1', isBlocked: true, accountType: 'SAVINGS', riskScore: 65, riskLevel: 'HIGH', riskFactors: [] },
        { userId: user._id, endpoint: '/api/transfer', method: 'POST', statusCode: 500, ipAddress: '1.1.1.1', accountType: 'SAVINGS', riskScore: 80, riskLevel: 'HIGH', riskFactors: [] }
    ]);

    const logs = await ApiLog.find({ userId: user._id }).lean();
    console.log('✓ Created test logs with risk scores:\n');
    logs.forEach(l => {
        console.log(`  ${l.endpoint} | Status: ${l.statusCode} | Risk: ${l.riskScore} | Level: ${l.riskLevel}`);
    });

    process.exit(0);
}

verify().catch(e => { console.error(e.message); process.exit(1); });
