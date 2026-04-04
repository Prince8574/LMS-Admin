<div align="center">

# 🎓 LEARNING MANAGEMENT SYSTEM
## ⚙️ Admin Panel — Project Report

<br/>

![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

<br/>

![GSAP](https://img.shields.io/badge/Animation-GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)
![Three.js](https://img.shields.io/badge/3D-Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Google OAuth](https://img.shields.io/badge/OAuth-Google-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Email-Nodemailer-0F9DCE?style=for-the-badge&logo=gmail&logoColor=white)
![PDFKit](https://img.shields.io/badge/PDF-PDFKit-FF0000?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)
![Multer](https://img.shields.io/badge/Upload-Multer-FF6600?style=for-the-badge&logo=files&logoColor=white)

<br/>

**Project Title:** LMS Admin Dashboard &nbsp;|&nbsp; **Author:** Prince &nbsp;|&nbsp; **Version:** 1.0.0

---

</div>

## 📋 1. Project Overview

The **LMS Admin Panel** is a comprehensive web-based administration dashboard designed to manage all aspects of a Learning Management System. It provides administrators with full control over courses, students, assignments, revenue, and platform settings through a modern and responsive interface.

---

## 🎯 2. Objectives

- ✅ Provide a centralized dashboard for managing the LMS platform
- ✅ Enable course creation, editing, and publishing workflows
- ✅ Track student enrollment, progress, and performance
- ✅ Automate certificate generation upon course completion
- ✅ Monitor revenue and payment transactions
- ✅ Google OAuth 2.0 Sign In for admins
- ✅ Industry-level server & browser console logging

---

## 🏗️ 3. System Architecture

```
┌─────────────────────────────────────────────────┐
│                  CLIENT LAYER                   │
│         React.js + GSAP + Three.js              │
└────────────────────┬────────────────────────────┘
                     │ HTTP / REST API
┌────────────────────▼────────────────────────────┐
│                 SERVER LAYER                    │
│          Node.js + Express.js (Port 5000)       │
│  Auth · Courses · Students · Revenue · Email    │
│         Google OAuth 2.0 · Passport.js          │
└────────────────────┬────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────────────┐
│               DATABASE LAYER                    │
│              MongoDB Atlas                      │
└─────────────────────────────────────────────────┘
```

---

## 📦 4. Module Description

| # | 🔷 Module | 📝 Description |
|---|-----------|----------------|
| 1 | 🔐 **Authentication** | JWT login, OTP verification, Google OAuth 2.0 |
| 2 | 📚 **Course Management** | Create, update, publish/unpublish courses with curriculum builder |
| 3 | 👨‍🎓 **Student Management** | View student profiles, enrollment status, and progress tracking |
| 4 | 📝 **Assignment Management** | Create assignments, review submissions, and provide grades/feedback |
| 5 | 💰 **Revenue & Analytics** | Payment tracking, revenue charts, and financial reports |
| 6 | 🏅 **Certificate Service** | Auto-generate and email PDF certificates on course completion |
| 7 | ⚙️ **Settings** | Platform-wide configuration including branding and permissions |
| 8 | 📧 **Email Notifications** | Automated email triggers via Nodemailer |

---

## 🛠️ 5. Technology Stack

| Layer | 🔧 Technology | 🎯 Purpose |
|-------|--------------|-----------|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat) | React.js 18 | UI rendering and component management |
| ![GSAP](https://img.shields.io/badge/-GSAP-88CE02?logo=greensock&logoColor=black&style=flat) | GSAP | Smooth UI transitions and animations |
| ![Three.js](https://img.shields.io/badge/-Three.js-000000?logo=threedotjs&logoColor=white&style=flat) | Three.js | Background visual effects |
| ![Node](https://img.shields.io/badge/-Node.js-339933?logo=nodedotjs&logoColor=white&style=flat) | Node.js | Server-side JavaScript execution |
| ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white&style=flat) | Express.js | REST API routing and middleware |
| ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white&style=flat) | MongoDB Atlas | NoSQL cloud database |
| ![JWT](https://img.shields.io/badge/-JWT-000000?logo=jsonwebtokens&logoColor=white&style=flat) | JWT + bcryptjs | Secure token-based auth |
| ![Google](https://img.shields.io/badge/-Google_OAuth-4285F4?logo=google&logoColor=white&style=flat) | Passport.js + Google OAuth 2.0 | Social login |
| ![Multer](https://img.shields.io/badge/-Multer-FF6600?style=flat) | Multer | Image and document uploads |
| ![Nodemailer](https://img.shields.io/badge/-Nodemailer-0F9DCE?logo=gmail&logoColor=white&style=flat) | Nodemailer | Transactional email delivery |
| ![PDFKit](https://img.shields.io/badge/-PDFKit-FF0000?logo=adobeacrobatreader&logoColor=white&style=flat) | PDFKit | Certificate PDF creation |

---

## 📁 6. Project Structure

```
admin/
├── 📂 public/                        # Static assets
├── 📂 src/
│   ├── 📂 backend/                   # Node.js + Express server
│   │   ├── 📂 config/
│   │   │   └── 📄 db.js              # MongoDB connection
│   │   ├── 📂 controllers/           # Business logic handlers
│   │   ├── 📂 middleware/            # Auth & validation middleware
│   │   ├── 📂 models/                # Mongoose data models
│   │   ├── 📂 routes/                # API route definitions
│   │   │   └── 📄 googleAuth.js      # Google OAuth routes
│   │   ├── 📂 services/              # Certificate & email services
│   │   ├── 📂 uploads/               # Uploaded media files
│   │   └── 📄 server.js              # Express app entry point
│   ├── 📂 frontend/                  # React pages & components
│   │   ├── 📂 AdminHome/             # Landing & dashboard
│   │   ├── 📂 Analytics/             # Analytics page
│   │   ├── 📂 Assignments/           # Assignment management
│   │   ├── 📂 Auth/                  # Login, Register, GoogleCallback
│   │   ├── 📂 Courses/               # Course management
│   │   ├── 📂 Revenue/               # Revenue analytics
│   │   ├── 📂 Settings/              # Platform settings
│   │   └── 📂 Students/              # Student management
│   ├── 📂 components/                # Shared UI components
│   └── 📄 App.js                     # Root component & routing
├── 📄 .gitignore
├── 📄 package.json
└── 📄 README.md
```

---

## 🌐 7. API Endpoints Summary

| Method | 🔗 Endpoint | 📋 Description |
|--------|------------|----------------|
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/auth/login` | Admin login |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/auth/send-otp` | Send OTP to email |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/auth/verify-otp` | Verify OTP |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/auth/google` | Google OAuth redirect |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/auth/google/callback` | Google OAuth callback |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/courses` | Get all courses |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/courses` | Create new course |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/students` | Get all students |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/assignments` | Get all assignments |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat) | `/api/assignments/:id/grade` | Grade a submission |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat) | `/api/revenue` | Get revenue data |

---

## 🚀 8. Installation & Setup

### ✅ Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)

### 💻 Frontend Setup
```bash
cd admin
npm install
npm start
```

### 🖥️ Backend Setup
```bash
cd admin/src/backend
npm install
node server.js
```

### 🔧 Environment Configuration

Create `.env` in `admin/src/backend/`:

```env
PORT                = 5000
MONGO_URI           = your_mongodb_connection_string
JWT_SECRET          = your_jwt_secret_key
JWT_EXPIRES         = 7d
CLIENT_URL          = http://localhost:3000
EMAIL_USER          = your_email@gmail.com
EMAIL_PASS          = your_app_password
GOOGLE_CLIENT_ID    = your_google_client_id
GOOGLE_CLIENT_SECRET= your_google_client_secret
GOOGLE_CALLBACK_URL = http://localhost:5000/api/auth/google/callback
```

---

## 🔐 9. Auth Flow

```
Email + Password  →  OTP Verify  →  Dashboard
Google Button     →  Google OAuth  →  Dashboard
```

> Google login requires the admin's Google email to be pre-registered in the admins collection.

---

## 🗄️ 10. Database Models

| 📊 Model | 🔑 Fields |
|---------|----------|
| 👤 **Admin** | name, email, password, role |
| 📚 **Course** | title, description, price, curriculum, isPublished |
| 🎓 **Student** | name, email, enrolledCourses, progress |
| 💰 **Revenue** | amount, studentId, courseId, date |
| ⚙️ **Settings** | platformName, logo, emailConfig, permissions |

---

## 🔒 11. Security Measures

- 🛡️ All routes protected with JWT middleware
- 🔑 Passwords hashed using bcryptjs (salt rounds: 12)
- 🌍 Environment variables for all sensitive credentials
- 🚧 CORS configured for allowed origins only
- ✅ Input validation on all API endpoints
- 🔐 Google OAuth with admin email whitelist

---

<div align="center">

---

**🎓 LMS Admin Panel** · Built with ❤️ using React & Node.js · © 2025 Prince

![GitHub](https://img.shields.io/badge/GitHub-Prince8574-181717?style=for-the-badge&logo=github&logoColor=white)

</div>
