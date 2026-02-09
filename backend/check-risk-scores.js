const mongoose = require('mongoose');
const ApiLog = require('./src/models/ApiLog');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Check logs with 400+ status
        const logs400 = await ApiLog.find({ statusCode: { $gte: 400 } }).sort({ createdAt: -1 }).limit(5).lean();
        console.log('\n=== Logs with Status >= 400 ===');
        logs400.forEach(log => {
            console.log(`  ${log.endpoint} | Status: ${log.statusCode} | Risk: ${log.riskScore} (${log.riskLevel}) | Reason: ${log.reason}`);
        });

        // Check blocked logs
        const blockedLogs = await ApiLog.find({ isBlocked: true }).sort({ createdAt: -1 }).limit(5).lean();
        console.log('\n=== Blocked Logs ===');
        blockedLogs.forEach(log => {
            console.log(`  ${log.endpoint} | Status: ${log.statusCode} | Risk: ${log.riskScore} (${log.riskLevel})`);
        });

        // Check 429 logs
        const rateLimitLogs = await ApiLog.find({ statusCode: 429 }).sort({ createdAt: -1 }).limit(5).lean();
        console.log('\n=== Rate Limit (429) Logs ===');
        rateLimitLogs.forEach(log => {
            console.log(`  ${log.endpoint} | Status: ${log.statusCode} | Risk: ${log.riskScore} (${log.riskLevel})`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

check();
