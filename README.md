# 🧠 EduBoard — Real-time Collaborative Whiteboard Platform

EduBoard is a full-stack, real-time collaborative whiteboard platform built for educational use. It allows teachers to create interactive whiteboard sessions and students to join and collaborate live.

The project focuses on real-time synchronization, role-based access control, and secure authentication.

---

## ✨ Features
- Real-time whiteboard collaboration using Socket.IO
- Live drawing, cursor sync, and canvas updates
- Role-based access (Student / Teacher / Admin)
- Teacher approval workflow via email verification
- Image uploads stored securely using Cloudinary
- Responsive dark-themed UI with light/dark toggle available on the whiteboard

---

## 🛠️ Tech Stack
**Frontend:** React, Tailwind CSS, Framer Motion  
**Backend:** Node.js, Express, Socket.IO  
**Database:** MongoDB  
**Services:** Cloudinary, Resend  

---

## 🚀 Deployment
- Frontend deployed on **Vercel**
- Backend deployed on **Render**
- Database hosted on **MongoDB Atlas**

---

## 🏗️ Project Structure
```text
eduboard/
├── client/   # React frontend
└── server/   # Node.js backend

```

---

## ⚙️ Running Locally
```bash
git clone https://github.com/KENZY004/eduboard.git
cd eduboard

cd server
npm install
npm run start

cd ../client
npm install
npm run dev
```
---

## 🌐 Live Demo
🔗 https://eduboard01.vercel.app/
