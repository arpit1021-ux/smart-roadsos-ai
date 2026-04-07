# Smart RoadSos AI - Submission Guide

This document outlines what to include in your hackathon submission ZIP file for Smart RoadSos AI.

## 📦 What to Include

### Core Project Files (REQUIRED)

```
smart-roadsos-ai/
├── backend/
│   ├── src/                    # All source code
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── utils/
│   ├── package.json
│   ├── package-lock.json      # Include for reproducibility
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── constants/
│   │   └── utils/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── Dockerfile
│
├── ai-module/
│   ├── model/                  # Pre-trained model files (OPTIONAL if re-trained)
│   │   ├── severity_model.joblib
│   │   ├── vehicle_encoder.joblib
│   │   ├── crash_encoder.joblib
│   │   └── severity_encoder.joblib
│   ├── app.py
│   ├── predictor.py
│   ├── train_model.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml          # Main deployment file
├── .env.example                # Environment template (NO actual secrets!)
├── README.md                   # Project documentation (OPTIONAL - can be submission doc)
├── package.json               # Root package.json if exists
└── SECURITY.md                # Security considerations
```

### Documentation Files (REQUIRED)

```
docs/
├── SUBMISSION_DOCUMENT.docx   # Detailed Word document
├── PRESENTATION.pptx          # 7-slide presentation
├── ARCHITECTURE.md            # Technical architecture details
├── API_DOCUMENTATION.md      # Complete API reference
├── USER_GUIDE.md             # How to use the platform
├── DEPLOYMENT_GUIDE.md       # Step-by-step deployment instructions
└── screenshots/              # Application screenshots
    ├── dashboard.png
    ├── report-accident.png
    ├── admin-dashboard.png
    ├── mobile-view.png
    └── map-view.png
```

---

## ❌ What to EXCLUDE (IMPORTANT!)

### DO NOT Include:

1. **`node_modules/` directories** - regenerate with `npm install`
2. **`__pycache__/` and `.pyc` files** - Python cache
3. **`venv/` or virtual environments** - use pip requirements.txt
4. **`.git/` directory** - version control history
5. **Large dataset files** - keep training data out, model files are fine (<10MB)
6. **Log files** (`backend/logs/`, `*.log`)
7. **IDE configuration files** (`.vscode/`, `.idea/`)
8. **Test databases or uploads** - keep clean
9. **Environment files with REAL secrets** - only `.env.example` without actual keys
10. **Build artifacts** (`dist/`, `build/`, `.next/`, `.nuxt/` - frontend can rebuild)
11. **Docker volumes/data** - databases will reinitialize
12. **Screen recordings or videos** - unless explicitly requested

---

## ✅ Pre-Submission Checklist

Before creating ZIP, run these commands to clean up:

### For Frontend:
```bash
cd frontend
rm -rf node_modules/.cache
rm -rf dist build .next  # if exists
```

### For Backend:
```bash
cd backend
rm -rf node_modules/.cache
rm -rf logs/*.log
```

### For AI Module:
```bash
cd ai-module
rm -rf __pycache__ *.pyc
rm -rf .pytest_cache
```

### Verify `.env` is clean:
```bash
# Make sure .env.example contains:
# GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
# JWT_SECRET=your-secret-key
# (no actual API keys or production secrets)
```

---

## 📝 Final ZIP Structure Example

```
SmartRoadSos_CodeRedAI_Submission.zip
│
├── smart-roadsos-ai/
│   ├── backend/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   └── Dockerfile
│   ├── frontend/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── index.html
│   │   └── Dockerfile
│   ├── ai-module/
│   │   ├── model/
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── README.md
│   └── SECURITY.md
│
├── docs/
│   ├── SUBMISSION_DOCUMENT.docx
│   ├── PRESENTATION.pptx
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── USER_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── screenshots/
│       ├── 01-dashboard.png
│       ├── 02-report-accident.png
│       ├── 03-admin-dashboard.png
│       ├── 04-map-view.png
│       └── 05-mobile-view.png
│
├── DEMO_SCRIPT.md            # 5-minute demo walkthrough
└── TEAM_INFO.txt             # Team members, roles, contact
```

---

## 📊 File Size Targets

**Ideal ZIP size:** 50-100 MB

**Breakdown:**
- Source code: ~10 MB
- Documentation: ~5 MB
- Screenshots: ~10 MB (optimized PNG, max 1920x1080)
- Pre-trained models: ~5 MB

**If ZIP >150MB:**
- Exclude `model/` directory (can retrain with `train_model.py`)
- Compress screenshots (use TinyPNG or ImageOptim)
- Use ZIP compression level 9

---

## 🎯 Submission Best Practices

1. **Test Before Zipping:**
   ```bash
   # Delete everything, unpack your ZIP, verify it runs
   docker-compose down -v
   docker-compose up -d
   # Should start without errors
   ```

2. **Include Pre-trained Models:**
   - Include `ai-module/model/severity_model.joblib` so AI works immediately
   - If space is an issue, include training script and note "model available upon request"

3. **Version Your Submission:**
   ```
   SmartRoadSos_CodeRedAI_v1.0_2026-04-07.zip
   ```

4. **Add Demo Script:**
   - Include `DEMO_SCRIPT.md` with step-by-step demo instructions
   - Include test user credentials
   - List known issues/limitations

5. **Multiple ZIP Parts:**
   - If >200MB, split: `submission_part1.zip`, `submission_part2.zip`
   - Part 1: Code and docs (essential)
   - Part 2: Media files (screenshots/videos)

6. **Readme in ZIP Root:**
   - Include `README_INSTRUCTIONS.txt` with quick setup steps

---

## 🚫 Common Mistakes to Avoid

❌ Including `node_modules` - bloats ZIP, easily reinstallable  
❌ Committing `.env` with real API keys - major security issue!  
❌ Forgetting `.env.example` - reviewers won't know required vars  
❌ Not testing on fresh machine - broken dependencies  
❌ Missing screenshots - no visual proof of UI  
❌ No deployment instructions - reviewers can't run it  
❌ Including test data - keep datasets to minimum  
❌ Hardcoded paths/ports - won't work on reviewer's machine  
❌ No demo script - reviewers don't know what to showcase  

---

## 📞 Questions?

Contact: contact@roadsos.ai  
GitHub Issues: https://github.com/CodeRedAI/SmartRoadSos/issues

**Good luck with your hackathon submission! 🏆**
