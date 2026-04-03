import pandas as pd
import numpy as np
from datetime import datetime
import joblib
import os

class SeverityPredictor:
    def __init__(self, model_path=None):
        """
        Initialize the severity predictor.

        Args:
            model_path: Path to trained .joblib model file. If None, uses rule-based fallback.
        """
        self.model = None
        self.model_type = 'rule-based'
        self.feature_names = []
        self.classes = ['low', 'medium', 'high', 'critical']

        if model_path and os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                self.model_type = type(self.model).__name__
                # Extract feature names if available
                if hasattr(self.model, 'feature_names_in_'):
                    self.feature_names = list(self.model.feature_names_in_)
                print(f"✅ ML model loaded: {self.model_type}")
            except Exception as e:
                print(f"❌ Failed to load model: {e}")
                self.model = None
        else:
            print("📊 Using rule-based predictor")

    def extract_features(self, speed, vehicle_type, crash_type, timestamp=None, location=None):
        """
        Extract feature vector from input data.

        Returns:
            dict: Feature dictionary for prediction
        """
        features = {
            'speed': float(speed) if speed else 0,
            'vehicle_type': vehicle_type or 'car',
            'crash_type': crash_type or 'single-vehicle',
            'hour_of_day': 12,
            'day_of_week': datetime.now().weekday(),
            'is_weekend': 0
        }

        # Parse timestamp if provided
        if timestamp:
            try:
                if isinstance(timestamp, str):
                    ts = pd.to_datetime(timestamp)
                else:
                    ts = timestamp
                features['hour_of_day'] = ts.hour
                features['day_of_week'] = ts.weekday()
                features['is_weekend'] = 1 if ts.weekday() >= 5 else 0
            except:
                pass

        return features

    def rule_based_predict(self, features):
        """
        Rule-based prediction as fallback.
        """
        score = 0
        details = {}
        speed = features['speed']

        # Speed factor (0-50 points)
        if speed >= 100:
            score += 50
            details['speed_score'] = 50
        elif speed >= 80:
            score += 40
            details['speed_score'] = 40
        elif speed >= 60:
            score += 30
            details['speed_score'] = 30
        elif speed >= 40:
            score += 20
            details['speed_score'] = 20
        elif speed >= 20:
            score += 10
            details['speed_score'] = 10
        else:
            details['speed_score'] = 0

        # Vehicle vulnerability (0-25 points)
        vulnerable_vehicles = ['bicycle', 'pedestrian', 'motorcycle', 'bike']
        vehicle_type = features['vehicle_type']
        if vehicle_type in vulnerable_vehicles:
            score += 25
            details['vehicle_score'] = 25
        elif vehicle_type == 'car':
            score += 15
            details['vehicle_score'] = 15
        else:
            score += 10
            details['vehicle_score'] = 10

        # Crash type severity (0-25 points)
        severe_crashes = ['head-on', 'multi-vehicle', 'rollover']
        moderate_crashes = ['side-impact', 'rear-end']
        crash_type = features['crash_type']
        if crash_type in severe_crashes:
            score += 25
            details['crash_score'] = 25
        elif crash_type in moderate_crashes:
            score += 15
            details['crash_score'] = 15
        else:
            details['crash_score'] = 10

        details['total_score'] = score

        # Map score to severity level
        if score >= 70:
            severity = 'critical'
            confidence = 0.75
        elif score >= 50:
            severity = 'high'
            confidence = 0.70
        elif score >= 30:
            severity = 'medium'
            confidence = 0.65
        else:
            severity = 'low'
            confidence = 0.60

        return severity, confidence, details

    def predict(self, speed, vehicle_type, crash_type, timestamp=None, location=None):
        """
        Predict accident severity.

        Returns:
            dict: {
                'severity': str,
                'confidence': float,
                'details': dict,
                'method': str
            }
        """
        # Extract features
        features = self.extract_features(speed, vehicle_type, crash_type, timestamp, location)
        details = {}

        # Use ML model if available
        if self.model is not None:
            try:
                # Prepare feature vector for sklearn model
                # This assumes the model expects specific features
                feature_vector = self.prepare_feature_vector(features)

                # Get prediction probabilities
                probabilities = self.model.predict_proba([feature_vector])[0]
                pred_idx = self.model.predict([feature_vector])[0]

                severity = self.classes[pred_idx] if isinstance(pred_idx, (int, np.integer)) else pred_idx
                confidence = float(probabilities.max())
                method = 'ml-' + self.model_type
            except Exception as e:
                print(f"ML prediction failed: {e}, falling back to rule-based")
                severity, confidence, details = self.rule_based_predict(features)
                method = 'rule-based'
        else:
            severity, confidence, details = self.rule_based_predict(features)
            method = 'rule-based'

        return {
            'severity': severity,
            'confidence': round(confidence, 2),
            'details': details,
            'method': method
        }

    def prepare_feature_vector(self, features):
        """
        Convert feature dict to vector for ML model.
        This is a placeholder - adjust based on your actual feature engineering.
        """
        # Simple encoding - in production, use proper preprocessing
        vehicle_map = {'car': 0, 'truck': 1, 'bus': 2, 'motorcycle': 3, 'bike': 4, 'bicycle': 5, 'pedestrian': 6}
        crash_map = {
            'single-vehicle': 0, 'rear-end': 1, 'side-impact': 2,
            'head-on': 3, 'rollover': 4, 'pedestrian': 5, 'multi-vehicle': 6
        }

        # Create numeric feature vector
        numeric_features = [
            features['speed'],
            features['hour_of_day'],
            float(features['day_of_week']),
            float(features['is_weekend']),
            vehicle_map.get(features['vehicle_type'], 0),
            crash_map.get(features['crash_type'], 0)
        ]

        return numeric_features

if __name__ == '__main__':
    # Test the predictor
    predictor = SeverityPredictor()

    test_data = {
        'speed': 80,
        'vehicle_type': 'car',
        'crash_type': 'head-on'
    }

    result = predictor.predict(**test_data)
    print(f"Prediction: {result}")
