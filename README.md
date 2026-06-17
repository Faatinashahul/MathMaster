# MathMaster 🧮 - Full-Stack Math Tutoring Platform

A complete math tutoring platform with teacher dashboard, student portal, live quiz features, gamification, and more.

## 🚀 Features

### Teacher
- Create tests (MCQ, Descriptive, Numerical, Image-based)
- Upload study materials (PDFs, PPTs, Videos)
- Live sessions (Quiz, Poll, Word Cloud, Q&A)
- View analytics (class & individual)
- Manage attendance
- Answer student doubts
- Post announcements
- Award badges to students

### Student  
- Take timed exams with anti-cheat
- View results with answer breakdown
- Download study materials
- Join live sessions from phone
- Mark attendance with code
- Post doubts with images
- Leaderboard & gamification (XP, levels, badges)
- Personal analytics & score trends

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts, Socket.io-client |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT |
| Storage | Cloudinary |
| Deployment | Vercel (frontend), Render (backend) |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

**Required .env values:**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm start
```

---

## 📁 Project Structure

```
mathapp/
├── backend/
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express API routes
│   ├── middleware/     # Auth & upload middleware
│   ├── utils/          # Socket.io handlers
│   └── server.js       # Entry point
└── frontend/
    └── src/
        ├── pages/
        │   ├── teacher/  # Teacher dashboard pages
        │   ├── student/  # Student portal pages
        │   └── auth/     # Login & register
        ├── context/      # Auth context
        ├── components/   # Shared components
        └── utils/        # API client
```

---

## 🔑 Default Demo Accounts

After registering, use these roles:
- **Teacher**: Register with role `teacher`
- **Student**: Register with role `student` + studentId + batch

---

## 🌐 Deployment

### Backend (Render)
1. Push code to GitHub
2. Create a new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables from `.env`

### Frontend (Vercel)
1. Push frontend folder to GitHub
2. Import project on Vercel
3. Set `REACT_APP_API_URL` to your Render backend URL
4. Deploy!

---

## 🎮 Gamification System

| XP Earned | Action |
|-----------|--------|
| marks × 2 | Submit a test |
| 50 | Perfect score |
| 10 | Mark attendance |

| Level | XP Required |
|-------|-------------|
| Beginner | 0 |
| Intermediate | 500 |
| Advanced | 1500 |
| Expert | 3000 |

---

## 📱 Live Session (Mentimeter-like)

1. Teacher opens **Live Session** page
2. Creates a Poll / Quiz / Word Cloud / Q&A
3. Students join via **Live Quiz** on their phones
4. Results display in real-time on teacher's screen

---

## 🔒 Anti-Cheat Features

- Fullscreen exam mode
- Tab switch detection & warning
- Copy-paste disabled on descriptive fields
- Auto-submit on timer expiry
- Question/option shuffling

---

Built with ❤️ for math students everywhere!
