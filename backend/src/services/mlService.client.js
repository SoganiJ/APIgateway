/**
 * ML Service Client for Node.js backend
 * Communicates with Python ML service via HTTP
 */

const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

class MLServiceClient {
    constructor() {
        this.baseUrl = ML_SERVICE_URL;
        this.timeout = 5000;
    }

    /**
     * Check ML service health
     */
    async health() {
        try {
            const response = await axios.get(`${this.baseUrl}/health`, { timeout: this.timeout });
            return response.data;
        } catch (error) {
            console.error('ML Service health check failed:', error.message);
            return { status: 'unavailable', error: error.message };
        }
    }

    /**
     * Train the model with new data
     * @param {Array} trainingData - Array of feature objects
     */
    async train(trainingData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/train`,
                { training_data: trainingData },
                { timeout: 30000 } // 30s timeout for training
            );
            return response.data;
        } catch (error) {
            console.error('ML Service training failed:', error.message);
            throw new Error(`Training failed: ${error.message}`);
        }
    }

    /**
     * Predict anomaly for single feature set
     * @param {Object} features - Feature object
     */
    async predict(features) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/predict`,
                { features },
                { timeout: this.timeout }
            );
            return response.data;
        } catch (error) {
            console.error('ML Service prediction failed:', error.message);
            // Return safe default on error
            return {
                anomaly_score: 0.0,
                is_anomaly: false,
                risk_level: 'LOW',
                action: 'Allow',
                reason: 'ML service unavailable',
                error: true
            };
        }
    }

    /**
     * Predict anomalies for batch of feature sets
     * @param {Array} featuresList - Array of feature objects
     */
    async predictBatch(featuresList) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/predict-batch`,
                { features_list: featuresList },
                { timeout: 15000 }
            );
            return response.data;
        } catch (error) {
            console.error('ML Service batch prediction failed:', error.message);
            return {
                predictions: (featuresList || []).map(() => ({
                    anomaly_score: 0.0,
                    is_anomaly: false,
                    risk_level: 'LOW',
                    action: 'Allow',
                    reason: 'ML service unavailable',
                    error: true
                }))
            };
        }
    }

    /**
     * Get model information
     */
    async getModelInfo() {
        try {
            const response = await axios.get(`${this.baseUrl}/model-info`, { timeout: this.timeout });
            return response.data;
        } catch (error) {
            console.error('ML Service model info failed:', error.message);
            return null;
        }
    }
}

// Export singleton instance
module.exports = new MLServiceClient();
