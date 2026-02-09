"""
Isolation Forest ML Model for API Traffic Anomaly Detection
Analyzes behavioral patterns to detect suspicious activity
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pickle
import os
import json
from datetime import datetime

class AnomalyDetector:
    def __init__(self, model_path='models/isolation_forest.pkl', scaler_path='models/scaler.pkl'):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.scaler = None
        
        # Feature names for consistency
        self.feature_names = [
            'requests_per_minute',
            'burst_count',
            'unique_endpoints',
            'avg_interval_ms',
            'is_authenticated',
            'time_of_day',
            'failed_requests',
            'rate_limit_hits'
        ]
        
        # Ensure models directory exists
        os.makedirs('models', exist_ok=True)
        
        # Load or initialize model
        self.load_model()
    
    def load_model(self):
        """Load existing model or create new one"""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(self.scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            print("✓ Loaded existing model")
        else:
            # Initialize new model
            self.model = IsolationForest(
                contamination=0.1,  # Expect 10% anomalies
                random_state=42,
                n_estimators=100,
                max_samples='auto',
                max_features=1.0
            )
            self.scaler = StandardScaler()
            print("✓ Initialized new model")
    
    def save_model(self):
        """Save trained model to disk"""
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(self.scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        print("✓ Model saved")
    
    def train(self, training_data):
        """
        Train Isolation Forest model
        training_data: List of feature dictionaries
        """
        if len(training_data) < 10:
            raise ValueError("Need at least 10 samples to train")
        
        # Convert to DataFrame
        df = pd.DataFrame(training_data)
        
        # Validate features
        for feature in self.feature_names:
            if feature not in df.columns:
                df[feature] = 0
        
        # Extract features in correct order
        X = df[self.feature_names].values
        
        # Fit scaler and transform
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled)
        
        # Save model
        self.save_model()
        
        return {
            'status': 'success',
            'samples_trained': len(training_data),
            'features': self.feature_names
        }
    
    def predict(self, features):
        """
        Predict anomaly score for single feature set
        Returns: {
            'anomaly_score': float (0-1, higher = more anomalous),
            'is_anomaly': bool,
            'risk_level': str,
            'action': str,
            'reason': str
        }
        """
        # Validate features
        feature_dict = {}
        for feature in self.feature_names:
            feature_dict[feature] = features.get(feature, 0)
        
        # Convert to array
        X = np.array([[feature_dict[f] for f in self.feature_names]])
        
        # Scale
        X_scaled = self.scaler.transform(X)
        
        # Get decision function score (lower = more anomalous)
        # Range: typically -0.5 to 0.5
        decision_score = self.model.decision_function(X_scaled)[0]
        
        # Convert to 0-1 scale (0 = normal, 1 = anomalous)
        # Using sigmoid-like transformation
        anomaly_score = 1 / (1 + np.exp(decision_score * 5))
        anomaly_score = float(np.clip(anomaly_score, 0, 1))
        
        # Predict (-1 = anomaly, 1 = normal)
        prediction = self.model.predict(X_scaled)[0]
        is_anomaly = prediction == -1
        
        # Determine risk level and action
        risk_level, action = self._get_risk_level(anomaly_score)
        
        # Generate reason
        reason = self._generate_reason(feature_dict, anomaly_score)
        
        return {
            'anomaly_score': round(anomaly_score, 3),
            'is_anomaly': is_anomaly,
            'risk_level': risk_level,
            'action': action,
            'reason': reason,
            'features': feature_dict
        }
    
    def predict_batch(self, features_list):
        """Predict anomaly scores for multiple feature sets"""
        results = []
        for features in features_list:
            results.append(self.predict(features))
        return results
    
    def _get_risk_level(self, score):
        """Map anomaly score to risk level and action"""
        if score > 0.9:
            return 'CRITICAL', 'Temporary Block'
        elif score > 0.8:
            return 'HIGH', 'Throttle + Alert'
        elif score >= 0.5:
            return 'MEDIUM', 'Monitor'
        else:
            return 'LOW', 'Allow'
    
    def _generate_reason(self, features, score):
        """Generate human-readable reason for anomaly"""
        reasons = []
        
        # Analyze each feature
        if features['burst_count'] > 3:
            reasons.append(f"High burst activity ({features['burst_count']} bursts)")
        
        if features['requests_per_minute'] > 50:
            reasons.append(f"Excessive request rate ({features['requests_per_minute']}/min)")
        
        if features['failed_requests'] > 5:
            reasons.append(f"Many failed requests ({features['failed_requests']})")
        
        if features['rate_limit_hits'] > 0:
            reasons.append(f"Rate limit violations ({features['rate_limit_hits']})")
        
        if features['avg_interval_ms'] < 100:
            reasons.append("Suspiciously fast request intervals")
        
        if features['time_of_day'] in [0, 1, 2, 3, 4, 5]:
            reasons.append("Unusual activity hours (late night)")
        
        if features['unique_endpoints'] > 10:
            reasons.append(f"Scanning behavior ({features['unique_endpoints']} endpoints)")
        
        if not features['is_authenticated']:
            reasons.append("Unauthenticated requests")
        
        if not reasons:
            if score > 0.7:
                reasons.append("Unusual behavioral pattern detected")
            else:
                reasons.append("Normal behavior")
        
        return " | ".join(reasons[:3])  # Return top 3 reasons


# Initialize global detector
detector = AnomalyDetector()


def train_model(training_data):
    """Train the model with new data"""
    return detector.train(training_data)


def predict_anomaly(features):
    """Predict anomaly for single feature set"""
    return detector.predict(features)


def predict_anomaly_batch(features_list):
    """Predict anomalies for batch of feature sets"""
    return detector.predict_batch(features_list)


if __name__ == "__main__":
    # Test the detector
    print("=== Testing Anomaly Detector ===\n")
    
    # Generate synthetic training data
    print("Generating training data...")
    np.random.seed(42)
    training_data = []
    
    # Normal traffic patterns
    for _ in range(80):
        training_data.append({
            'requests_per_minute': np.random.randint(5, 30),
            'burst_count': np.random.randint(0, 2),
            'unique_endpoints': np.random.randint(1, 5),
            'avg_interval_ms': np.random.randint(500, 3000),
            'is_authenticated': 1,
            'time_of_day': np.random.randint(8, 20),
            'failed_requests': np.random.randint(0, 2),
            'rate_limit_hits': 0
        })
    
    # Anomalous patterns
    for _ in range(20):
        training_data.append({
            'requests_per_minute': np.random.randint(60, 150),
            'burst_count': np.random.randint(5, 15),
            'unique_endpoints': np.random.randint(8, 20),
            'avg_interval_ms': np.random.randint(50, 200),
            'is_authenticated': np.random.choice([0, 1]),
            'time_of_day': np.random.randint(0, 6),
            'failed_requests': np.random.randint(5, 20),
            'rate_limit_hits': np.random.randint(1, 5)
        })
    
    # Train
    print("Training model...")
    result = train_model(training_data)
    print(f"✓ Trained on {result['samples_trained']} samples\n")
    
    # Test predictions
    print("=== Test Predictions ===\n")
    
    # Normal behavior
    print("1. Normal User:")
    normal = predict_anomaly({
        'requests_per_minute': 15,
        'burst_count': 1,
        'unique_endpoints': 3,
        'avg_interval_ms': 2000,
        'is_authenticated': 1,
        'time_of_day': 14,
        'failed_requests': 0,
        'rate_limit_hits': 0
    })
    print(f"   Score: {normal['anomaly_score']} | Risk: {normal['risk_level']} | Action: {normal['action']}")
    print(f"   Reason: {normal['reason']}\n")
    
    # Suspicious behavior
    print("2. Suspicious User:")
    suspicious = predict_anomaly({
        'requests_per_minute': 85,
        'burst_count': 8,
        'unique_endpoints': 12,
        'avg_interval_ms': 120,
        'is_authenticated': 1,
        'time_of_day': 2,
        'failed_requests': 15,
        'rate_limit_hits': 3
    })
    print(f"   Score: {suspicious['anomaly_score']} | Risk: {suspicious['risk_level']} | Action: {suspicious['action']}")
    print(f"   Reason: {suspicious['reason']}\n")
    
    print("✓ Anomaly detector ready!")
