# MathMaster 🎓

> A full-stack math tutoring platform with live quizzes, auto-grading, attendance tracking, gamification, and more.

**Live App:** https://track1-project-491515.web.app  
**Backend API:** https://mathmaster-backend-897186966863.us-central1.run.app

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Overview](#api-overview)
- [Roles & Permissions](#roles--permissions)
- [Gamification System](#gamification-system)

---

## Features

### Teacher
- Create tests with MCQ, Descriptive, Numerical, and Image-based questions
- Auto-grade MCQ and numerical answers
- Manually evaluate descriptive answers with comments
- Upload study materials (PDF, PPT, Video) via Cloudinary
- Run live sessions — Poll, Quiz, Word Cloud, Q&A (Mentimeter-like)
- Generate attendance codes for class
- View class analytics and individual student performance
- Post announcements with priority levels
- Answer student doubts with text and images
- Award badges to students

### Student
- Take timed tests in fullscreen anti-cheat mode
- View results with answer breakdown and teacher feedback
- Mark attendance with teacher-generated code
- Join live quiz sessions from phone
- Download study materials
- Post doubts with images
- View personal analytics and chapter-wise performance
- Leaderboard with XP points, levels, and badges

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| File Storage | Cloudinary |
| Realtime | Socket.io |
| Frontend Hosting | Firebase Hosting |
| Backend Hosting | Google Cloud Run |

---

## Project Structure

```
mathapp/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema (student/teacher/admin)
│   │   ├── Test.js           # Test and question schema
│   │   ├── Submission.js     # Student submission schema
│   │   └── index.js          # Material, Attendance, Doubt, Announcement models
│   ├── routes/
│   │   ├── auth.js           # Register, login, /me
│   │   ├── tests.js          # CRUD tests, submit, evaluate, grade
│   │   ├── materials.js      # Upload/list/delete study materials
│   │   ├── attendance.js     # Generate code, mark attendance
│   │   ├── doubts.js         # Post, answer, resolve doubts
│   │   ├── announcements.js  # Post and list announcements
│   │   ├── live.js           # Live session management
│   │   ├── analytics.js      # Class and student analytics
│   │   ├── teacher.js        # Student list, award badges
│   │   └── student.js        # Student-specific endpoints
│   ├── middleware/
│   │   ├── auth.js           # JWT protect + role authorize
│   │   └── upload.js         # Cloudinary + Multer
│   ├── utils/
│   │   └── socket.js         # Socket.io event handlers
│   ├── server.js             # Express + Socket.io entry point
│   ├── .env.example          # Environment variable template
│   └── package.json
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.jsx       # Public landing page
        │   ├── auth/
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   ├── teacher/
        │   │   ├── Dashboard.jsx
        │   │   ├── CreateTest.jsx
        │   │   ├── ManageTests.jsx
        │   │   ├── EvaluateSubmissions.jsx
        │   │   ├── Materials.jsx
        │   │   ├── Analytics.jsx
        │   │   ├── Students.jsx
        │   │   ├── LiveSession.jsx
        │   │   ├── AttendanceManager.jsx
        │   │   ├── Doubts.jsx
        │   │   └── Announcements.jsx
        │   └── student/
        │       ├── Dashboard.jsx
        │       ├── Tests.jsx
        │       ├── TakeTest.jsx
        │       ├── Results.jsx
        │       ├── Materials.jsx
        │       ├── Analytics.jsx
        │       ├── Leaderboard.jsx
        │       ├── Doubts.jsx
        │       ├── LiveQuiz.jsx
        │       └── MarkAttendance.jsx
        ├── components/
        │   └── shared/
        │       └── Layout.jsx    # App shell with sidebar/header
        ├── context/
        │   └── AuthContext.jsx   # Auth state management
        ├── utils/
        │   └── api.js            # Axios instance with JWT interceptor
        └── App.jsx               # Routes and protected route logic
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### 1. Clone and install

```bash
# Backend
cd mathapp/backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev

# Frontend (new terminal)
cd mathapp/frontend
npm install
npm uninstall tailwindcss @tailwindcss/postcss
npm install tailwindcss@3 autoprefixer postcss
npm start
```

### 2. Create frontend `.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Environment Variables

Create `backend/.env` with these values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/mathmaster?appName=Cluster0
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:3000

# Optional — only needed for email features
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

| Variable | Where to get it |
|----------|----------------|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers |
| `JWT_SECRET` | Any random string you create |
| `CLOUDINARY_*` | Cloudinary dashboard |
| `SMTP_*` | Gmail → App Passwords (optional) |

---

## Deployment

### Backend → Google Cloud Run

```bash
cd mathapp/backend

# Create env vars file
cat > env.yaml << 'EOF'
MONGODB_URI: "your_mongodb_uri"
JWT_SECRET: "your_jwt_secret"
JWT_EXPIRE: "7d"
CLOUDINARY_CLOUD_NAME: "your_cloud_name"
CLOUDINARY_API_KEY: "your_api_key"
CLOUDINARY_API_SECRET: "your_api_secret"
CLIENT_URL: "https://your-firebase-url.web.app"
EOF

# Deploy
gcloud run deploy mathmaster-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --env-vars-file env.yaml
```

### Frontend → Firebase Hosting

```bash
cd mathapp/frontend

# Set backend URL
echo "REACT_APP_API_URL=https://your-backend-url.run.app/api" > .env

npm run build

firebase init hosting --project your-firebase-project
# Public dir: build | Single page app: Yes | GitHub: No

firebase deploy
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with username/phone + password |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/tests/student/available` | Get published tests for student |
| POST | `/api/tests` | Create test (teacher) |
| POST | `/api/tests/:id/start` | Start a test attempt |
| POST | `/api/tests/:id/submit` | Submit test answers |
| GET | `/api/materials` | List study materials |
| POST | `/api/materials` | Upload material (teacher) |
| POST | `/api/attendance/generate` | Generate attendance code |
| POST | `/api/attendance/mark` | Mark attendance with code |
| GET | `/api/doubts` | List all doubts |
| POST | `/api/doubts` | Post a doubt |
| POST | `/api/doubts/:id/answer` | Answer a doubt (teacher) |
| GET | `/api/analytics/leaderboard` | Class leaderboard |
| GET | `/api/analytics/student/me` | Personal analytics |

---

## Roles & Permissions

| Feature | Student | Teacher | Admin |
|---------|---------|---------|-------|
| Take tests | ✅ | ❌ | ✅ |
| Create tests | ❌ | ✅ | ✅ |
| Grade submissions | ❌ | ✅ | ✅ |
| Upload materials | ❌ | ✅ | ✅ |
| Mark attendance | ✅ | ❌ | ✅ |
| Generate att. code | ❌ | ✅ | ✅ |
| Post doubts | ✅ | ❌ | ✅ |
| Answer doubts | ❌ | ✅ | ✅ |
| Run live session | ❌ | ✅ | ✅ |
| View leaderboard | ✅ | ✅ | ✅ |
| Award badges | ❌ | ✅ | ✅ |

---

## Gamification System

### XP Points
| Action | XP Earned |
|--------|----------|
| Submit a test | marks obtained × 2 |
| Perfect score | +50 bonus XP |
| Mark attendance | +10 XP |

### Levels
| Level | XP Required |
|-------|------------|
| Beginner | 0 XP |
| Intermediate | 500 XP |
| Advanced | 1500 XP |
| Expert | 3000 XP |

### Badges
Awarded manually by teachers for achievements like "Top Scorer", "Most Improved", "Perfect Attendance", etc.

---

## Anti-Cheat Features

- Fullscreen exam mode (exits fullscreen = warning)
- Tab switch detection (teacher can see count)
- Copy-paste disabled on descriptive fields
- Auto-submit when timer expires
- Question and option shuffling per student

---

## Live Session (Socket.io Events)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Student joins class room |
| `question-launched` | Server → Client | Teacher launches question |
| `live-answer` | Client → Server | Student submits quiz answer |
| `poll-answer` | Client → Server | Student votes in poll |
| `wordcloud-answer` | Client → Server | Student submits word |
| `qa-question` | Client → Server | Student posts Q&A question |
| `activity-ended` | Server → Client | Teacher ends activity |

---

## License

Built for educational use. All rights reserved.
