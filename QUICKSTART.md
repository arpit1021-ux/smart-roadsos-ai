# 🚀 Quick Start Guide

Get up and running with Smart RoadSos AI in 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- Google Maps API Key (get one free: https://console.cloud.google.com/)

## Steps

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
4. Go to Credentials → Create Credentials → API Key
5. Copy the key

### 2. Setup Environment

```bash
cd project-folder
cp .env.example .env
```

Open `.env` and set:
```
GOOGLE_MAPS_API_KEY=your-actual-key-here
JWT_SECRET=any-random-32-char-string
```

*(Optional)* Add Twilio credentials for SMS:
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Start Everything

```bash
docker-compose up -d
```

Wait 30 seconds for services to start.

### 4. Access the App

- **Frontend:** http://localhost
- **Backend API:** http://localhost:5000
- **AI Module:** http://localhost:5001/health

### 5. Train AI Model (Optional)

For better predictions:

```bash
docker-compose exec ai-module python train_model.py
```

### 6. Create Your Account

1. Open http://localhost
2. Click "Sign up here" on the login page
3. Register with your details
4. Add emergency contacts in the Contacts section
5. Start reporting accidents!

---

## 🎯 Quick Test

1. Go to Dashboard
2. Click "📍 Update Location" (or click on map)
3. Select accident location on map
4. Click "Report Accident"
5. Fill out form with:
   - Speed: 60 km/h
   - Vehicle: Car
   - Crash type: Head-on
6. Submit 🚨

---

## 📱 Mobile Testing

Open http://localhost on your phone - the app is fully responsive! Allow location access for GPS reporting.

---

## 🐛 Issues?

**Port already in use?**
```bash
# Stop containers
docker-compose down
# Kill processes on ports 80, 5000, 5001
# Then restart
docker-compose up -d
```

**MongoDB can't connect?**
```bash
# Check MongoDB container
docker-compose logs mongodb
# Restart if needed
docker-compose restart mongodb
```

**Maps not loading?**
- Double-check your Google Maps API key in `.env`
- Ensure you enabled all required APIs
- Check browser console for errors

**AI predictions not working?**
```bash
# Check AI module logs
docker-compose logs ai-module
# Retrain model if needed
docker-compose exec ai-module python train_model.py
```

---

## 🎉 That's it!

You now have a fully functional emergency response system running locally.

### Next Steps:
- Add real emergency contacts
- Configure Twilio for real SMS alerts
- Integrate with actual emergency services APIs
- Deploy to production!

For detailed documentation, see [README.md](README.md).
