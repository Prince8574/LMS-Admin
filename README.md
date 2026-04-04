# LearnVerse — Admin Panel

> Full-featured LMS Admin Dashboard built with React, Node.js, Express & MongoDB.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, GSAP, Three.js |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT, OTP (Email), Google OAuth 2.0 |
| Email | Nodemailer (Gmail) |
| File Upload | Multer |

---

## Features

- Google OAuth 2.0 Sign In
- Email + OTP two-step login
- Forgot / Reset password via OTP
- Course management (create, edit, delete, publish)
- Student management with drawer view
- Assignment creation with multi-step builder
- Submission grading with feedback
- Revenue analytics dashboard
- Certificate generation (PDF)
- Settings management
- Industry-level server + browser console logs

---

## Project Structure

```
admin/
├── src/
│   ├── backend/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Auth, Course, Student, Assignment, Revenue
│   │   ├── middleware/      # JWT auth middleware
│   │   ├── models/          # Admin, Course, Student, Revenue, Settings
│   │   ├── routes/          # All API routes + Google OAuth
│   │   ├── services/        # Email, Certificate
│   │   └── server.js
│   ├── components/          # Sidebar, AnimatedAvatar
│   ├── frontend/
│   │   ├── AdminHome/       # Dashboard landing
│   │   ├── Analytics/       # Analytics page
│   │   ├── Assignments/     # Assignment management
│   │   ├── Auth/            # Login, Register, Google OAuth callback
│   │   ├── Courses/         # Course management
│   │   ├── Revenue/         # Revenue page
│   │   ├── Settings/        # Settings page
│   │   └── Students/        # Student management
│   └── App.js
└── package.json
```

---

## Getting Started

### 1. Install dependencies

```bash
# Frontend
cd admin
npm install

# Backend
cd admin/src/backend
npm install
```

### 2. Configure environment

Create `admin/src/backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=7d
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 3. Run

```bash
# Backend
cd admin/src/backend
node server.js

# Frontend (new terminal)
cd admin
npm start
```

Frontend: `http://localhost:3000`
Backend API: `http://localhost:5000/api`

---

## Auth Flow

```
Email/Password → OTP verify → Dashboard
Google Button  → Google OAuth → Dashboard
```

> Admin Google login requires the Google account email to be pre-registered in the admins collection.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/send-otp` | Send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/google` | Google OAuth redirect |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/courses` | Get all courses |
| GET | `/api/students` | Get all students |
| GET | `/api/assignments` | Get all assignments |
| GET | `/api/revenue` | Revenue data |

---

## Environment Notes

- `.env` files are gitignored — never commit secrets
- Google OAuth credentials shared between admin and student panel
- OTP expires in 10 minutes
