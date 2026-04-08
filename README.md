<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=7c2fff&height=200&section=header&text=LearnVerse%20Admin&fontSize=48&fontColor=ffffff&fontAlignY=38&desc=LMS%20Admin%20Panel%20v2.6&descAlignY=58&descSize=18" width="100%"/>

# ⚙️ LMS Admin Panel — Project Report

<br/>

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

<br/>

[![GSAP](https://img.shields.io/badge/Animation-GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://greensock.com)
[![Three.js](https://img.shields.io/badge/3D-Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![Google OAuth](https://img.shields.io/badge/OAuth-Google-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com)
[![PDFKit](https://img.shields.io/badge/PDF-PDFKit-FF0000?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](https://pdfkit.org)

<br/>

> **Project Title:** LMS Admin Dashboard &nbsp;|&nbsp; **Author:** Prince &nbsp;|&nbsp; **Version:** 2.6.0

<br/>

[![GitHub stars](https://img.shields.io/github/stars/Prince8574/LMS-Admin?style=social)](https://github.com/Prince8574/LMS-Admin)
&nbsp;&nbsp;
[![GitHub last commit](https://img.shields.io/github/last-commit/Prince8574/LMS-Admin?color=7c2fff)](https://github.com/Prince8574/LMS-Admin)

</div>

---

## 📋 1. Project Overview

The **LearnVerse Admin Panel** is a full-featured, role-based LMS administration dashboard built with React 19 + Node.js + MongoDB Atlas. It gives platform owners and instructors complete control over courses, students, assignments, revenue, and settings — all in a single, beautiful interface.

```
🎯 One platform to manage courses · students · revenue · instructors
```

---

## 🎯 2. Objectives

| # | Objective | Status |
|---|-----------|--------|
| 1 | Centralized dashboard for LMS management | ✅ Done |
| 2 | Course creation, editing & publishing workflow | ✅ Done |
| 3 | Student enrollment, progress & performance tracking | ✅ Done |
| 4 | Assignment grading & certificate auto-generation | ✅ Done |
| 5 | Revenue monitoring & financial reports | ✅ Done |
| 6 | Google OAuth 2.0 + JWT + OTP authentication | ✅ Done |
| 7 | Role-based access control (Super Admin / Instructor) | ✅ Done |
| 8 | Instructor management & analytics dashboard | ✅ Done |

---

## 🏗️ 3. System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│          React 19 · GSAP · Three.js · CSS            │
│         localhost:3000  (Admin Panel)                │
└─────────────────────┬────────────────────────────────┘
                      │  REST API  (HTTP/JSON)
┌─────────────────────▼────────────────────────────────┐
│                   SERVER LAYER                       │
│           Node.js + Express.js  :5000                │
│   Auth · Courses · Students · Revenue · Upload       │
│        Google OAuth 2.0 · Passport.js · JWT          │
└─────────────────────┬────────────────────────────────┘
                      │  MongoDB Driver
┌─────────────────────▼────────────────────────────────┐
│                  DATABASE LAYER                      │
│               MongoDB Atlas (Cloud)                  │
│  admins · courses · users · enrollments · payments   │
└──────────────────────────────────────────────────────┘
```

---

## 👥 4. Role-Based Access Control

> **v2.6 Feature** — Multi-role system with scoped data access

```
┌─────────────────────────────────────────────────────────────┐
│                       ADMIN ROLES                           │
├───────────────────┬─────────────────────────────────────────┤
│  👑 super_admin   │  Full access — all data, all pages      │
│  👨‍🏫 instructor   │  Own courses, assignments & students     │
└───────────────────┴─────────────────────────────────────────┘
```

### Access Matrix

| 📄 Page | 👑 Super Admin | 👨‍🏫 Instructor |
|---------|:--------------:|:--------------:|
| 🏠 Dashboard | ✅ | ✅ |
| 📚 Courses | ✅ All | ✅ Own only |
| 📝 Assignments | ✅ All | ✅ Own only |
| 👥 Students | ✅ All | ✅ Own enrolled |
| � Revenue | ✅ | ❌ |
| 📊 Analytics | ✅ | ❌ |
| �‍🏫 Instructors | ✅ | ❌ |
| �️ Moderation | ✅ | ❌ |
| ⚙️ Settings | ✅ | ✅ |

---

## 📦 5. Module Description

| # | � Module | � Description |
|---|-----------|----------------|
| 1 | 🔐 **Authentication** | JWT login, OTP email verify, Google OAuth 2.0 |
| 2 | � **Course Management** | Create, edit, publish courses with curriculum builder |
| 3 | 👨‍🎓 **Student Management** | Profiles, enrollment, progress — role-filtered |
| 4 | � **Assignment Management** | Create, grade submissions, generate certificates |
| 5 | � **Revenue & Analytics** | Transactions, payouts, charts, financial reports |
| 6 | 👨‍🏫 **Instructors Dashboard** | Analytics, profile drawer, add/remove instructors |
| 7 | 🏅 **Certificate Service** | Auto PDF certificate generation via PDFKit |
| 8 | ⚙️ **Settings** | Profile, security, notifications, platform config |
| 9 | � **Email Notifications** | OTP, welcome, certificate emails via Nodemailer |

---

## �️ 6. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat) | React.js 19 | UI rendering & routing |
| ![GSAP](https://img.shields.io/badge/-GSAP-88CE02?logo=greensock&logoColor=black&style=flat) | GSAP 3.14 | Animations & transitions |
| ![Three.js](https://img.shields.io/badge/-Three.js-000000?logo=threedotjs&logoColor=white&style=flat) | Three.js | Particle backgrounds |
| ![Node](https://img.shields.io/badge/-Node.js-339933?logo=nodedotjs&logoColor=white&style=flat) | Node.js | Server runtime |
| ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white&style=flat) | Express.js | REST API framework |
| ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white&style=flat) | MongoDB Atlas | Cloud NoSQL database |
| ![JWT](https://img.shields.io/badge/-JWT-000000?logo=jsonwebtokens&logoColor=white&style=flat) | JWT + bcryptjs | Token auth & password hashing |
| ![Google](https://img.shields.io/badge/-Google_OAuth-4285F4?logo=google&logoColor=white&style=flat) | Passport.js | Social login |
| ![Multer](https://img.shields.io/badge/-Multer-FF6600?style=flat) | Multer | File & image uploads |
| ![Nodemailer](https://img.shields.io/badge/-Nodemailer-0F9DCE?logo=gmail&logoColor=white&style=flat) | Nodemailer | Email delivery |
| ![PDFKit](https://img.shields.io/badge/-PDFKit-FF0000?logo=adobeacrobatreader&logoColor=white&style=flat) | PDFKit | Certificate PDF generation |

---

## 📁 7. Project Structure

```
admin/
├── 📂 public/
├── 📂 src/
│   ├── 📂 backend/                        # Node.js + Express API
│   │   ├── 📂 config/
│   │   │   └── 📄 db.js                   # MongoDB connection
│   │   ├── 📂 controllers/
│   │   │   ├── 📄 authController.js       # Login, register, instructor CRUD
│   │   │   ├── 📄 courseController.js     # Role-filtered course ops
│   │   │   ├── 📄 assignmentController.js # Role-filtered assignments
│   │   │   ├── 📄 studentController.js    # Role-filtered students
│   │   │   ├── 📄 revenueController.js
│   │   │   └── 📄 settingsController.js
│   │   ├── 📂 middleware/
│   │   │   └── 📄 authMiddleware.js       # JWT protect + superAdminOnly
│   │   ├── 📂 models/
│   │   │   ├── 📄 Admin.js
│   │   │   ├── 📄 Course.js
│   │   │   ├── 📄 Student.js              # instructorCourseIds filter
│   │   │   └── � Revenue.js
│   │   ├── 📂 routes/
│   │   │   ├── 📄 authRoutes.js           # + instructor management routes
│   │   │   ├── 📄 courseRoutes.js
│   │   │   ├── � googleAuth.js
│   │   │   └── 📄 uploadRoutes.js         # avatar save to DB
│   │   ├── 📂 services/
│   │   │   ├── 📄 certificateService.js
│   │   │   └── 📄 emailService.js
│   │   └── 📄 server.js
│   │
│   ├── 📂 frontend/
│   │   ├── 📂 AdminHome/                  # Landing & dashboard
│   │   ├── 📂 Analytics/
│   │   ├── 📂 Assignments/
│   │   ├── 📂 Auth/
│   │   ├── 📂 Courses/
│   │   ├── 📂 Instructors/                # ← NEW in v2.6
│   │   │   ├── 📄 InstructorsPage.js
│   │   │   ├── 📄 InstructorsPage.css
│   │   │   └── 📄 index.js
│   │   ├── 📂 Revenue/
│   │   ├── 📂 Settings/
│   │   ├── 📂 Status/
│   │   └── 📂 Students/
│   │
│   ├── 📂 components/
│   │   ├── 📄 Sidebar.js                  # Role-based menu items
│   │   └── 📄 AnimatedAvatarSmall.js
│   │
│   └── 📄 App.js                          # Routes + SuperAdminRoute guard
│
├── 📄 .gitignore
├── 📄 package.json
└── 📄 README.md
```

---

## 🌐 8. API Endpoints

### � Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/auth/login` | Admin login |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/auth/register` | Register admin |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/auth/send-otp` | Send OTP |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/auth/verify-otp` | Verify OTP |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/auth/me` | Get current user |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/auth/google` | Google OAuth |

### �‍🏫 Instructor Management *(super_admin only)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/auth/instructors` | Create instructor |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/auth/instructors` | List all instructors |
| ![DELETE](https://img.shields.io/badge/DELETE-F93E3E?style=flat) | `/api/auth/instructors/:id` | Remove instructor |

### 📚 Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/courses` | Get courses (role-filtered) |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/courses` | Create course |
| ![PUT](https://img.shields.io/badge/PUT-FCA130?style=flat) | `/api/courses/:id` | Update course |
| ![DELETE](https://img.shields.io/badge/DELETE-F93E3E?style=flat) | `/api/courses/:id` | Delete course |
| ![PATCH](https://img.shields.io/badge/PATCH-50E3C2?style=flat) | `/api/courses/:id/publish` | Toggle publish |

### 👥 Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/students` | Get students (role-filtered) |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/students` | Add student |
| ![PATCH](https://img.shields.io/badge/PATCH-50E3C2?style=flat) | `/api/students/:id/status` | Update status |

### 📝 Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/assignments` | Get assignments (role-filtered) |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/assignments` | Create assignment |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/assignments/:id/grade` | Grade submission |

---

## 🚀 9. Installation & Setup

### ✅ Prerequisites
```
Node.js v18+  ·  MongoDB Atlas account  ·  Google Cloud Console project
```

### 💻 Frontend
```bash
cd admin
npm install
npm start          # → http://localhost:3000
```

### �️ Backend
```bash
cd admin/src/backend
npm install
node server.js     # → http://localhost:5000
```

### 🔧 Environment Variables
Create `admin/src/backend/.env`:

```env
PORT                 = 5000
MONGO_URI            = mongodb+srv://<user>:<pass>@cluster.mongodb.net/learnverse
DB_NAME              = learnverse
JWT_SECRET           = your_super_secret_key
JWT_EXPIRES          = 7d
CLIENT_URL           = http://localhost:3000
EMAIL_USER           = your_email@gmail.com
EMAIL_PASS           = your_app_password
GOOGLE_CLIENT_ID     = your_google_client_id
GOOGLE_CLIENT_SECRET = your_google_client_secret
GOOGLE_CALLBACK_URL  = http://localhost:5000/api/auth/google/callback
ADMIN_SECRET_KEY     = SuperAdmin2026
SERVER_URL           = http://localhost:5000
```

---

## ☁️ 9b. Production Deployment

### 🌐 Live URLs
| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://lms-admin-c2p8.vercel.app |
| Backend | Render | https://lms-admin-emcy.onrender.com |
| Database | MongoDB Atlas | learnverse cluster |

### Frontend — Vercel
1. Push to GitHub → Vercel auto-deploys from `main` branch
2. Add env variable in Vercel dashboard → Environment Variables:
   ```
   REACT_APP_API_URL = https://lms-admin-emcy.onrender.com/api/auth
   ```
3. `admin/.env.production` and `admin/vercel.json` set `DISABLE_ESLINT_PLUGIN=true`

### Backend — Render
- Root directory: `src/backend`
- Build command: `npm install`
- Start command: `node server.js`

Required env vars on Render:
```env
PORT=10000
MONGO_URI=mongodb+srv://...
DB_NAME=learnverse
JWT_SECRET=...
JWT_EXPIRES=7d
CLIENT_URL=https://lms-admin-c2p8.vercel.app
ALLOWED_ORIGINS=https://lms-admin-c2p8.vercel.app
BREVO_SMTP_LOGIN=your_brevo_login
BREVO_SMTP_PASSWORD=your_brevo_smtp_key
BREVO_API_KEY=your_brevo_api_key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://lms-admin-emcy.onrender.com/api/auth/google/callback
ADMIN_SECRET_KEY=SuperAdmin2026
ADMIN_BACKEND_URL=https://lms-admin-emcy.onrender.com
```

### Key Production Changes
- `server.js` binds to `0.0.0.0` instead of `127.0.0.1`
- `ALLOWED_ORIGINS` env var for dynamic CORS
- `src/config/api.js` — central API base URL (replaces all hardcoded `localhost:5000`)
- `emailService.js` uses Brevo HTTP API (avoids SMTP port blocking on Render free tier)
- `healthCheckService.js` uses `ADMIN_BACKEND_URL` / `STUDENT_BACKEND_URL` env vars

---

## 🔐 10. Auth Flow

```
┌─────────────────────────────────────────────────────┐
│                   LOGIN OPTIONS                     │
├─────────────────────┬───────────────────────────────┤
│  � Email + Password│  → OTP Verify → Dashboard     │
│  � Google Button   │  → OAuth 2.0  → Dashboard     │
└─────────────────────┴───────────────────────────────┘

After login → JWT token → role decoded → scoped dashboard

Register with `ADMIN_SECRET_KEY` → `super_admin` role
Register without key → `instructor` role
```

> ⚠️ Google login requires the email to be pre-registered in the `admins` collection.

---

## �️ 11. Database Models

| � Model | � Key Fields |
|---------|--------------|
| 👤 **Admin** | name, email, password, role (`super_admin` / `instructor`), avatar |
| � **Course** | title, description, price, curriculum, adminId, instructor, isPublished |
| 🎓 **Student** | name, email, enrolledCourses, avgProgress, plan, status |
| � **Revenue** | amount, st udentId, courseId, date, status |
| ⚙️ **Settings** | platformName, logo, emailConfig, permissions |
| � **Assignment** | title, courseId, createdBy, dueDate, maxScore |
| � **Submission** | assignmentId, student, score, status, certificateId |

---

## 🔒 12. Security Measures

```
🛡️  JWT middleware on all protected routes
🔑  bcryptjs password hashing (salt: 12)
🌍  All secrets in .env (never committed)
🚧  CORS restricted to allowed origins
✅  Input validation on all endpoints
🔐  Google OAuth with DB email whitelist
�  SuperAdminRoute guard on sensitive pages
```

---

## 📊 13. Instructors Dashboard *(New in v2.6)*

A dedicated analytics page for super admins to monitor all instructors.

```
/instructors
├── 📈 Overview Tab
│   ├── Revenue Bar Chart (per instructor)
│   ├── Course Distribution Donut
│   └── Top Performers Cards with Sparklines
│
├── 👨‍🏫 All Instructors Tab
│   ├── Searchable grid with stats
│   └── Click → Full Profile Drawer
│       ├── Email, Join Date, Account ID
│       ├── 6 KPI stats (Revenue, Courses, Students...)
│       ├── Course list with thumbnails
│       └── Remove Instructor (with confirm)
│
└── 📊 Analytics Tab
    ├── Revenue Leaderboard
    ├── Published vs Draft breakdown
    └── Student Distribution
```

---

## 🔄 14. Changelog

### 🆕 v2.6 — Role-Based Access Control

| # | Feature | Details |
|---|---------|---------|
| 1 | 👑 Super Admin role | Full platform access |
| 2 | 👨‍🏫 Instructor role | Scoped to own data only |
| 3 | 📊 Instructors Page | Charts, leaderboard, profile drawer |
| 4 | 🗂️ Profile Drawer | Email, join date, courses, remove action |
| 5 | 🖼️ Avatar in DB | Photo saved to `admins` collection |
| 6 | 👥 My Students | Instructors see only their enrolled students |
| 7 | 🔒 Route Guards | `SuperAdminRoute` on sensitive pages |
| 8 | 🏷️ Role Badge | Sidebar shows 👑 / 👨‍🏫 badge |
| 9 | ➕ Add Instructor | Super admin creates instructor accounts |
| 10 | 🔧 Orphan Fix | Courses from deleted admins auto-transferred |
| 11 | 🔑 Secret Key Register | `ADMIN_SECRET_KEY` in `.env` → `super_admin` on register |
| 12 | 🛡️ Moderation Page | Route added, coming soon placeholder |
| 13 | 🖼️ Avatar URL Fix | Uses `SERVER_URL` env var instead of hardcoded localhost |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=7c2fff&height=120&section=footer" width="100%"/>

**🎓 LearnVerse Admin Panel v2.6** · Built with ❤️ using React & Node.js

[![GitHub](https://img.shields.io/badge/GitHub-Prince8574-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Prince8574)
&nbsp;
[![Version](https://img.shields.io/badge/Version-2.6.0-7c2fff?style=for-the-badge)](https://github.com/Prince8574/LMS-Admin)

© 2026 Prince Kumar · LearnVerse Technologies

</div>
