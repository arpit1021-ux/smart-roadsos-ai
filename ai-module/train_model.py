#!/usr/bin/env python
"""
Train a severity prediction model using synthetic data.

This script generates synthetic training data and trains a Random Forest classifier.
For production, replace with real accident dataset.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import os
from datetime import datetime

def generate_synthetic_data(n_samples=10000):
    """Generate synthetic accident data for training."""
    np.random.seed(42)

    # Speed distribution (km/h)
    speeds = np.random.exponential(scale=30, size=n_samples) + 20
    speeds = np.clip(speeds, 0, 150).astype(int)

    # Vehicle types
    vehicle_types = ['car', 'truck', 'bus', 'motorcycle', 'bike', 'bicycle', 'pedestrian']
    vehicle_probs = [0.5, 0.15, 0.1, 0.1, 0.05, 0.05, 0.05]
    vehicles = np.random.choice(vehicle_types, size=n_samples, p=vehicle_probs)

    # Crash types
    crash_types = [
        'single-vehicle', 'rear-end', 'side-impact',
        'head-on', 'rollover', 'pedestrian', 'multi-vehicle'
    ]
    crash_probs = [0.3, 0.25, 0.2, 0.1, 0.05, 0.05, 0.05]
    crashes = np.random.choice(crash_types, size=n_samples, p=crash_probs)

    # Time features
    hours = np.random.randint(0, 24, size=n_samples)
    days = np.random.randint(0, 7, size=n_samples)
    weekends = (days >= 5).astype(int)

    # Calculate severity based on simple rules (target)
    severities = []
    for i in range(n_samples):
        score = 0
        speed = speeds[i]
        vehicle = vehicles[i]
        crash = crashes[i]

        # Speed factor
        if speed >= 100:
            score += 50
        elif speed >= 80:
            score += 40
        elif speed >= 60:
            score += 30
        elif speed >= 40:
            score += 20
        else:
            score += 10

        # Vehicle vulnerability
        if vehicle in ['bicycle', 'pedestrian', 'motorcycle', 'bike']:
            score += 25
        elif vehicle == 'car':
            score += 15
        else:
            score += 10

        # Crash severity
        if crash in ['head-on', 'multi-vehicle', 'rollover']:
            score += 25
        elif crash in ['side-impact', 'rear-end']:
            score += 15

        # Map to severity
        if score >= 70:
            severities.append('critical')
        elif score >= 50:
            severities.append('high')
        elif score >= 30:
            severities.append('medium')
        else:
            severities.append('low')

    # Create DataFrame
    df = pd.DataFrame({
        'speed': speeds,
        'vehicle_type': vehicles,
        'crash_type': crashes,
        'hour_of_day': hours,
        'day_of_week': days,
        'is_weekend': weekends,
        'severity': severities
    })

    return df

def prepare_features(df):
    """Prepare features for training."""
    # Encode categorical variables
    vehicle_encoder = LabelEncoder()
    crash_encoder = LabelEncoder()
    severity_encoder = LabelEncoder()

    X = pd.DataFrame()
    X['speed'] = df['speed']
    X['hour_of_day'] = df['hour_of_day']
    X['day_of_week'] = df['day_of_week']
    X['is_weekend'] = df['is_weekend']
    X['vehicle_type'] = vehicle_encoder.fit_transform(df['vehicle_type'])
    X['crash_type'] = crash_encoder.fit_transform(df['crash_type'])

    y = severity_encoder.fit_transform(df['severity'])

    return X, y, vehicle_encoder, crash_encoder, severity_encoder

def train_model():
    """Train and evaluate the model."""
    print("🤖 Generating synthetic training data...")
    df = generate_synthetic_data(n_samples=10000)
    print(f"📊 Dataset shape: {df.shape}")
    print(f"📈 Severity distribution:\n{df['severity'].value_counts(normalize=True).round(3)}")

    X, y, vehicle_enc, crash_enc, severity_enc = prepare_features(df)

    print("\n🎯 Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training set: {X_train.shape}")
    print(f"Test set: {X_test.shape}")

    print("\n🌲 Training Random Forest classifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_split=10,
        min_samples_leaf=5,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    print("\n📋 Cross-validation score:")
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
    print(f"CV Accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")

    print("\n🎯 Test set performance:")
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)

    print(classification_report(
        y_test, y_pred,
        target_names=severity_enc.classes_
    ))

    print("\n🔍 Feature importances:")
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)

    for _, row in feature_importance.iterrows():
        print(f"  {row['feature']}: {row['importance']:.4f}")

    return {
        'model': model,
        'vehicle_encoder': vehicle_enc,
        'crash_encoder': crash_enc,
        'severity_encoder': severity_enc,
        'feature_importance': feature_importance
    }

def save_model(model_data, output_dir='model'):
    """Save trained model and encoders."""
    os.makedirs(output_dir, exist_ok=True)

    # Save main model
    model_path = os.path.join(output_dir, 'severity_model.joblib')
    joblib.dump(model_data['model'], model_path)
    print(f"\n✅ Model saved to: {model_path}")

    # Save encoders
    encoders = {
        'vehicle_encoder': model_data['vehicle_encoder'],
        'crash_encoder': model_data['crash_encoder'],
        'severity_encoder': model_data['severity_encoder']
    }

    for name, encoder in encoders.items():
        encoder_path = os.path.join(output_dir, f'{name}.joblib')
        joblib.dump(encoder, encoder_path)
        print(f"✅ {name} saved to: {encoder_path}")

    # Save feature importance
    importance_path = os.path.join(output_dir, 'feature_importance.csv')
    model_data['feature_importance'].to_csv(importance_path, index=False)
    print(f"✅ Feature importance saved to: {importance_path}")

    return model_path

if __name__ == '__main__':
    print("=" * 60)
    print("🚧 Smart RoadSos AI - Model Training")
    print("=" * 60)

    try:
        model_data = train_model()
        save_model(model_data)

        print("\n" + "=" * 60)
        print("✅ Training complete!")
        print("📁 Model files saved to 'model/' directory")
        print("💡 To use: python app.py")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
