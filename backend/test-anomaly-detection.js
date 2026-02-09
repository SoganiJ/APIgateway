const mongoose = require('mongoose');
require('dotenv').config();

async function testAnomalyDetection() {
    console.log('🔍 Testing Anomaly Detection System...\n');
    
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected\n');
        
        // Test 1: Check ApiLog model
        const ApiLog = require('./src/models/ApiLog');
        console.log('📊 Testing ApiLog model with ANONYMOUS accountType...');
        
        const testLog = new ApiLog({
            endpoint: '/api/test',
            method: 'GET',
            statusCode: 200,
            ipAddress: '127.0.0.1',
            accountType: 'SAVINGS',
            riskScore: 0,
            riskLevel: 'LOW'
        });
        
        const validationError = testLog.validateSync();
        if (validationError) {
            console.log('❌ Validation Error:', validationError.message);
        } else {
            console.log('✅ ApiLog validation passed\n');
        }
        
        // Test 2: Check recent logs
        const recentLogs = await ApiLog.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
        });
        console.log(`📈 Recent logs (last 5 min): ${recentLogs}`);
        
        // Test 3: Check distinct users
        const activeUsers = await ApiLog.distinct('userId', {
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
        });
        console.log(`👥 Active users: ${activeUsers.filter(u => u).length}\n`);
        
        // Test 4: Feature extraction
        console.log('🔬 Testing feature extraction...');
        const { extractBatchFeatures } = require('./src/services/featureExtraction.service');
        const features = await extractBatchFeatures(5);
        console.log(`✅ Extracted features for ${features.length} users\n`);
        
        if (features.length > 0) {
            console.log('📋 Sample features:', JSON.stringify(features[0], null, 2));
        }
        
        // Test 5: ML Service health
        console.log('\n🤖 Testing ML Service connection...');
        const mlServiceClient = require('./src/services/mlService.client');
        const health = await mlServiceClient.health();
        console.log('ML Service Status:', health);
        
        if (health.status === 'healthy') {
            console.log('\n✅ ALL TESTS PASSED! Anomaly detection is ready!\n');
        } else {
            console.log('\n⚠️  ML Service is offline. Start it with:');
            console.log('   cd ml-service');
            console.log('   D:/Vault_Gate/.venv/Scripts/python.exe app.py\n');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}

testAnomalyDetection();
