<div align="center">

# LEARNING MANAGEMENT SYSTEM
## Admin Panel — Project Report

---

**Project Title:** LMS Admin Dashboard  
**Technology Stack:** React.js · Node.js · Express.js · MongoDB  
**Repository:** [LMS-Admin](https://github.com/Prince8574/LMS-Admin)  
**Author:** Prince  
**Version:** 1.0.0

---

</div>

## 1. Project Overview

The **LMS Admin Panel** is a comprehensive web-based administration dashboard designed to manage all aspects of a Learning Management System. It provides administrators with full control over courses, students, assignments, revenue, and platform settings through a modern and responsive interface.

---

## 2. Objectives

- Provide a centralized dashboard for managing the LMS platform
- Enable course creation, editing, and publishing workflows
- Track student enrollment, progress, and performance
- Automate certificate generation upon course completion
- Monitor revenue and payment transactions
- Moderate community content and user activity

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────┐
│                  CLIENT LAYER                   │
│         React.js + GSAP + Three.js              │
└────────────────────┬────────────────────────────┘
                     │ HTTP / REST API
┌────────────────────▼────────────────────────────┐
│                 SERVER LAYER                    │
│          Node.js + Express.js (Port 5000)       │
│   Auth · Courses · Students · Revenue · Email   │
└────────────────────┬────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────────────┐
│               DATABASE LAYER                    │
│              MongoDB Atlas                      │
└─────────────────────────────────────────────────┘
```

---

## 4. Module Description

| # | Module | Description |
|---|--------|-------------|
| 1 | **Authentication** | JWT-based secure admin login and session management |
| 2 | **Course Management** | Create, update, publish/unpublish courses with curriculum builder |
| 3 | **Student Management** | View student profiles, enrollment status, and progress tracking |
| 4 | **Assignment Management** | Create assignments, review submissions, and provide grades/feedback |
| 5 | **Revenue & Analytics** | Payment tracking, revenue charts, and financial reports |
| 6 | **Certificate Service** | Auto-generate and email PDF certificates on course completion |
| 7 | **Settings** | Platform-wide configuration including branding and permissions |
| 8 | **Community Moderation** | Review and moderate user posts and flagged content |
| 9 | **Email Notifications** | Automated email triggers via Nodemailer |

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React.js 18 | UI rendering and component management |
| Animation | GSAP | Smooth UI transitions and animations |
| 3D Graphics | Three.js | Background visual effects |
| Backend Runtime | Node.js | Server-side JavaScript execution |
| Web Framework | Express.js | REST API routing and middleware |
| Database | MongoDB Atlas | NoSQL cloud database |
| ODM | Mongoose | MongoDB object modeling |
| Authentication | JWT + bcryptjs | Secure token-based auth |
| File Upload | Multer | Image and document uploads |
| Email Service | Nodemailer | Transactional email delivery |
| PDF Generation | PDFKit | Certificate PDF creation |

---

## 6. Project Structure

```
admin/
├── public/                        # Static assets
├── src/
│   ├── backend/                   # Node.js + Express server
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/           # Business logic handlers
│   │   ├── middleware/            # Auth & validation middleware
│   │   ├── models/                # Mongoose data models
│   │   ├── routes/                # API route definitions
│   │   ├── services/              # Certificate & email services
│   │   ├── uploads/               # Uploaded media files
│   │   └── server.js              # Express app entry point
│   ├── frontend/                  # React pages & components
│   │   ├── AdminHome/             # Landing & dashboard
│   │   ├── Assignments/           # Assignment management
│   │   ├── Auth/                  # Login & register
│   │   ├── Courses/               # Course management
│   │   ├── Revenue/               # Revenue analytics
│   │   ├── Settings/              # Platform settings
│   │   └── Students/              # Student management
│   ├── components/                # Shared UI components
│   └── App.js                     # Root component & routing
├── .gitignore
├── package.json
└── README.md
```

---

## 7. API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/courses` | Get all courses |
| POST | `/api/courses` | Create new course |
| GET | `/api/students` | Get all students |
| GET | `/api/assignments` | Get all assignments |
| POST | `/api/assignments/:id/grade` | Grade a submission |
| GET | `/api/revenue` | Get revenue data |
| GET | `/api/settings` | Get platform settings |

---

## 8. Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- npm or yarn

### Frontend Setup
```bash
cd admin
npm install
npm start
```

### Backend Setup
```bash
cd admin/src/backend
npm install
npm run dev
```

### Environment Configuration

Create `.env` file in `admin/src/backend/`:

```env
MONGO_URI        = your_mongodb_connection_string
JWT_SECRET       = your_jwt_secret_key
EMAIL_USER       = your_email@gmail.com
EMAIL_PASS       = your_app_password
PORT             = 5000
```

---

## 9. Database Models

| Model | Fields |
|-------|--------|
| **Admin** | name, email, password, role |
| **Course** | title, description, price, curriculum, isPublished |
| **Student** | name, email, enrolledCourses, progress |
| **Revenue** | amount, studentId, courseId, date |
| **Settings** | platformName, logo, emailConfig, permissions |

---

## 10. Security Measures

- All routes protected with JWT middleware
- Passwords hashed using bcryptjs (salt rounds: 10)
- Environment variables for all sensitive credentials
- CORS configured for allowed origins only
- Input validation on all API endpoints

---

<div align="center">

---

**LMS Admin Panel** · Built with React & Node.js · © 2025  ❤️ Prince

</div>
