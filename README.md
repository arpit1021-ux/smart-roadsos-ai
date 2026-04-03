# 🚑 Smart RoadSos AI

A full-stack emergency response system for road accidents with AI-powered severity prediction, real-time location tracking, and integrated emergency services.

![Dashboard Preview](docs/images/dashboard.png)

## ✨ Features

- **One-Click Accident Reporting** - Report accidents instantly with GPS location
- **AI Severity Prediction** - Machine learning model predicts accident severity based on speed, vehicle type, and crash type
- **Live Emergency Services Map** - See nearby hospitals, police stations, and ambulance services on Google Maps
- **Fastest Route Calculation** - Get optimal routes to nearest trauma centers
- **SMS Emergency Alerts** - Automatically notify emergency contacts via Twilio
- **Real-Time Updates** - WebSocket-powered live status updates for response teams
- **Dark Mode** - Full dark mode support throughout the app
- **Mobile Responsive** - Optimized for both desktop and mobile devices
- **Emergency Dashboard** - Admin dashboard for coordinating responses

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │────▶│    MongoDB     │
│  React + Vue    │     │  Node.js +      │     │                 │
│  Tailwind CSS   │     │  Express        │     │                 │
│  Google Maps    │     │  Socket.io      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                        │
         │                        ▼
         │               ┌─────────────────┐
         └──────────────▶│  AI Module      │
                         │  Python +       │
                         │  Flask +        │
                         │  Scikit-learn   │
                         └─────────────────┘
```

---

## 📋 Prerequisites

**Required:**
- Node.js 18+ (https://nodejs.org/)
- Python 3.10+ (https://www.python.org/)
- MongoDB 4.4+ (https://www.mongodb.com/)
- Google Maps API Key (for Maps JavaScript API, Places API, Directions API)
- Docker & Docker Compose (recommended for easy setup)

**Optional:**
- Twilio Account (for SMS notifications)

---

## 🚀 Quick Start (Docker - Recommended)

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd Hackathon
   cp .env.example .env
   ```

2. **Edit `.env` and add your API keys:**
   ```bash
   # Required
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars

   # Optional (for SMS)
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost (port 80)
   - Backend API: http://localhost:5000
   - AI Module: http://localhost:5001
   - MongoDB: localhost:27017

5. **Train the AI model (optional):**
   ```bash
   docker-compose exec ai-module python train_model.py
   ```

---

## 🛠️ Manual Setup (Development)

### 1. Backend Setup

```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your configuration
mongod  # Start MongoDB (or use your own instance)
npm run dev
```

Backend will run on http://localhost:5000

### 2. AI Module Setup

```bash
cd ai-module
pip install -r requirements.txt
# Optional: Train the ML model
python train_model.py
python app.py
```

AI service will run on http://localhost:5001

### 3. Frontend Setup

```bash
cd frontend
npm install
cp ../.env.example .env
npm run dev
```

Frontend will run on http://localhost:5173

---

## 📚 API Documentation

### Authentication
All protected routes require a Bearer token in the Authorization header.

```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

#### Emergency Contacts
- `GET /api/contacts` - List contacts (protected)
- `POST /api/contacts` - Add contact (protected)
- `PUT /api/contacts/:id` - Update contact (protected)
- `DELETE /api/contacts/:id` - Delete contact (protected)

#### Accident Reports
- `POST /api/accidents` - Report accident (protected)
- `GET /api/accidents` - Get user's accidents (protected)
- `GET /api/accidents/:id` - Get accident details (protected)
- `PUT /api/accidents/:id/status` - Update status (protected)
- `GET /api/accidents/nearby?lat=&lng=&radius=` - Nearby accidents (protected)

#### Emergency Services
- `GET /api/services/nearby?lat=&lng=&type=` - Get nearby services (public)
- `GET /api/services/route?origin=&destination=` - Calculate route (public)

#### AI Prediction
- `POST /api/ai/predict` - Predict severity (protected, proxies to AI module)

### WebSocket Events

Connect to `/socket.io`:

**Client → Server:**
- `join_accident_room` - Subscribe to accident updates
- `leave_accident_room` - Unsubscribe from updates

**Server → Client:**
- `status_update` - Accident status changed
- `new_accident` - New accident reported

---

## 🔧 Configuration

### Required API Keys

1. **Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable Maps JavaScript API, Places API, Directions API, Geocoding API
   - Create credentials → API Key
   - Restrict key to your domain/IP

2. **Twilio SMS** (Optional)
   - Sign up at [Twilio](https://www.twilio.com/)
   - Get Account SID, Auth Token, and phone number
   - Configure in `.env`

### MongoDB Setup

**Local MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongo mongo:5

# Or install locally: https://www.mongodb.com/try/download/community
```

**MongoDB Atlas (Cloud):**
```bash
# Update .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roadsos
```

---

## 🧠 AI Model

The AI module uses a Random Forest classifier trained on synthetic accident data.

**Features:**
- Speed (km/h)
- Vehicle type (categorical)
- Crash type (categorical)
- Time of day
- Day of week

**Severity Classes:** low, medium, high, critical

**Fallback:** If the ML model is unavailable, a rule-based system provides predictions.

**Training Your Own Model:**
```bash
cd ai-module
python train_model.py
# Model saved to ai-module/model/severity_model.joblib
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### E2E Testing
```bash
# Cypress (if configured)
npx cypress open
```

---

## 📱 User Guide

### For Accident Victims:
1. Login or register an account
2. Click "Report Accident" from dashboard
3. Allow location access or select location on map
4. Enter accident details (speed, vehicle, crash type)
5. Review AI severity prediction
6. Confirm report - emergency contacts will be SMS'd
7. Track status updates in real-time

### For Emergency Coordinators:
1. Login to admin dashboard
2. View all accidents on map and list
3. Update accident status (enroute, arrived, etc.)
4. Dispatch nearest services
5. Monitor response times and outcomes

---

## 🔐 Security

- **Authentication**: JWT tokens (7-day expiry)
- **Authorization**: Protected routes with middleware
- **Input Validation**: express-validator on all endpoints
- **Rate Limiting**: Implement rate limiting in production
- **Secrets**: All secrets in environment variables
- **HTTPS**: Required in production

---

## 🚀 Production Deployment

### Before deploying:

**Security Checklist:**
- [ ] Change `JWT_SECRET` to a 256-bit random string
- [ ] Enable MongoDB authentication
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable helmet security headers
- [ ] Configure logging with Winston
- [ ] Set up monitoring (Grafana, Prometheus)
- [ ] Backup MongoDB regularly

**Performance:**
- [ ] Enable Redis for Socket.io adapter (multi-instance)
- [ ] Configure CDN for static assets
- [ ] Enable database indexes (already in models)
- [ ] Set up load balancer for multiple backend instances
- [ ] Configure health checks

**Monitoring & Alerts:**
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up alerts for failed health checks
- [ ] Monitor Google Maps API usage/costs

### Deploy with Docker:

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Or manually:
docker build -t roadsos-backend ./backend
docker build -t roadsos-ai ./ai-module
docker build -t roadsos-frontend ./frontend
docker-compose -f docker-compose.yml up -d
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps | grep mongo
# Or for local installation
ps aux | grep mongod
```

### Google Maps Not Loading
- Verify API key is correct in `.env`
- Check API is enabled in Google Cloud Console
- Check browser console for errors
- Ensure key restrictions are properly configured

### WebSocket Not Connecting
- Check backend is running on port 5000
- Verify CORS settings
- Check browser console for connection errors
- Ensure `socket.io` client version matches server

### AI Predictions Returning Rules-Based
- ML model not trained or file missing
- Check logs: `ai-module/logs/`
- Run `python train_model.py` to generate model

---

## 📁 Project Structure

```
smart-roadsos-ai/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & validation
│   │   ├── services/       # SMS, Maps, AI
│   │   ├── sockets/        # WebSocket setup
│   │   └── utils/          # Helper functions
│   ├── logs/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API & Socket clients
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # Auth & Theme context
│   │   ├── constants/      # App constants
│   │   └── utils/
│   ├── public/
│   └── package.json
├── ai-module/
│   ├── model/              # Trained models
│   ├── app.py              # Flask application
│   ├── predictor.py        # Prediction logic
│   ├── train_model.py      # Training script
│   └── requirements.txt
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Google Maps Platform for mapping APIs
- Twilio for SMS notifications
- MongoDB for database services
- Flask & scikit-learn for AI capabilities

---

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**⚠️ Disclaimer:** This is an emergency response system prototype. For production use, ensure compliance with local regulations, conduct thorough security reviews, and integrate with official emergency services systems.
