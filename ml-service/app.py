"""
Flask API server for ML anomaly detection
Provides endpoints for training and prediction
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import anomaly_detector
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ml-anomaly-detection',
        'model_loaded': anomaly_detector.detector.model is not None
    })

@app.route('/train', methods=['POST'])
def train():
    """
    Train the model with new data
    POST body: { "training_data": [...] }
    """
    try:
        data = request.get_json()
        training_data = data.get('training_data', [])
        
        if len(training_data) < 10:
            return jsonify({
                'error': 'Need at least 10 samples to train'
            }), 400
        
        result = anomaly_detector.train_model(training_data)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict anomaly for single feature set
    POST body: { "features": {...} }
    """
    try:
        data = request.get_json()
        features = data.get('features', {})
        
        result = anomaly_detector.predict_anomaly(features)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """
    Predict anomalies for multiple feature sets
    POST body: { "features_list": [{...}, {...}] }
    """
    try:
        data = request.get_json()
        features_list = data.get('features_list', [])
        
        results = anomaly_detector.predict_anomaly_batch(features_list)
        return jsonify({
            'predictions': results,
            'count': len(results)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        'features': anomaly_detector.detector.feature_names,
        'model_type': 'Isolation Forest',
        'risk_thresholds': {
            'low': '< 0.5 (Allow)',
            'medium': '0.5-0.8 (Monitor)',
            'high': '> 0.8 (Throttle + Alert)',
            'critical': '> 0.9 (Temporary Block)'
        }
    })

if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5001))
    print(f"🤖 ML Service starting on port {port}...")
    print(f"🧠 Model: Isolation Forest")
    print(f"📊 Features: {', '.join(anomaly_detector.detector.feature_names)}")
    app.run(host='0.0.0.0', port=port, debug=True)
