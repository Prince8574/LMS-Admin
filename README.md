# 🎓 LMS Admin Panel

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

A full-featured **Learning Management System Admin Dashboard** built with React, Node.js, Express, and MongoDB.

</div>

---

## ✨ Features

- 🔐 **Admin Authentication** — Secure login with JWT
- 📚 **Course Management** — Create, edit, publish/unpublish courses
- 👨‍🎓 **Student Management** — View, manage and track students
- 📝 **Assignments** — Create assignments and grade submissions
- 📊 **Revenue Analytics** — Track payments and revenue charts
- ⚙️ **Settings** — Platform-wide configuration
- 🏅 **Certificate Generation** — Auto-generate PDF certificates
- 📧 **Email Notifications** — Nodemailer integration
- 🌐 **Community Moderation** — Manage posts and flags

---

## 🗂️ Project Structure

```
admin/
├── public/
├── src/
│   ├── backend/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── server.js
│   ├── frontend/
│   │   ├── AdminHome/
│   │   ├── Assignments/
│   │   ├── Courses/
│   │   ├── Students/
│   │   ├── Revenue/
│   │   ├── Settings/
│   │   └── Auth/
│   └── App.js
```

---

## 🚀 Getting Started

### Frontend

```bash
cd admin
npm install
npm start
```

### Backend

```bash
cd admin/src/backend
npm install
npm run dev
```

---

## 🔧 Environment Variables

Create a `.env` file in `src/backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
PORT=5000
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, GSAP, Three.js |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Email | Nodemailer |
| PDF | PDFKit |

---

<div align="center">
Made with ❤️ by Prince
</div>
