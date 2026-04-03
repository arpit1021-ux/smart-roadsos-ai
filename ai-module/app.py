from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import sys
import pandas as pd
from predictor import SeverityPredictor

app = Flask(__name__)
CORS(app)

# Initialize predictor
predictor = None

def initialize_predictor():
    """Initialize the severity predictor with trained model or rule-based fallback"""
    global predictor
    model_path = os.path.join(os.path.dirname(__file__), 'model', 'severity_model.joblib')

    try:
        if os.path.exists(model_path):
            predictor = SeverityPredictor(model_path=model_path)
            print(f"✅ Loaded ML model from {model_path}")
        else:
            print("⚠️ Model not found, using rule-based predictor")
            predictor = SeverityPredictor()
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("⚠️ Falling back to rule-based predictor")
        predictor = SeverityPredictor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Smart RoadSos AI - Severity Prediction',
        'model_loaded': predictor is not None,
        'timestamp': pd.Timestamp.now().isoformat()
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Predict accident severity"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        # Extract features
        speed = data.get('speed', 0)
        vehicle_type = data.get('vehicle_type', 'car')
        crash_type = data.get('crash_type', 'single-vehicle')
        timestamp = data.get('timestamp')
        location = data.get('location')

        # Validate required fields
        if not vehicle_type or not crash_type:
            return jsonify({
                'success': False,
                'message': 'vehicle_type and crash_type are required'
            }), 400

        # Make prediction
        result = predictor.predict(
            speed=speed,
            vehicle_type=vehicle_type,
            crash_type=crash_type,
            timestamp=timestamp,
            location=location
        )

        return jsonify({
            'success': True,
            'severity': result['severity'],
            'confidence': result['confidence'],
            'details': result.get('details', {}),
            'method': result.get('method', 'unknown')
        }), 200

    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Prediction failed',
            'error': str(e)
        }), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    return jsonify({
        'model_type': predictor.model_type if predictor else 'none',
        'features': predictor.feature_names if predictor else [],
        'classes': predictor.classes if predictor else []
    }), 200

if __name__ == '__main__':
    initialize_predictor()
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
