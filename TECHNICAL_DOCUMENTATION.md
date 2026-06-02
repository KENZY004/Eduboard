# EduBoard - Technical Documentation

## 🎯 Project Overview
EduBoard is a real-time collaborative whiteboard platform designed for educational purposes, enabling teachers to create interactive sessions and students to join and collaborate in real-time.

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router DOM** - Client-side routing
- **Framer Motion** - Animations & transitions
- **Axios** - HTTP client for API calls
- **Socket.IO Client** - Real-time communication
- **React Icons** - Icon library
- **FontAwesome** - Additional icons
- **Tailwind CSS** - Utility-first CSS (via inline classes)
- **Google Identity Services SDK** - Student OAuth2 integration

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **bcrypt** - Password hashing
- **jsonwebtoken (JWT)** - Authentication tokens
- **Nodemailer** - Email service (SMTP)
- **Resend** - Alternative email service
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing
- **Google UserInfo API** - Auth verification for Google accounts

### **Development Tools**
- **Git** - Version control
- **ESLint** - Code linting
- **Vercel** - Frontend deployment
- **Render** - Backend deployment

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
├─────────────────────────────────────────────────────────────┤
│  React App (Vite)                                           │
│  ├── Pages (Landing, Features, About, Login, Signup)       │
│  ├── Dashboard (Teacher/Student)                            │
│  ├── Whiteboard Component (Canvas + Tools)                  │
│  ├── Admin Panel                                            │
│  └── Socket.IO Client (Real-time events)                    │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                         SERVER SIDE                          │
├─────────────────────────────────────────────────────────────┤
│  Express Server (Node.js)                                   │
│  ├── REST API Routes                                        │
│  │   ├── /api/auth (Login, Signup)                         │
│  │   ├── /api/boards (CRUD operations)                     │
│  │   └── /api/admin (User management)                      │
│  ├── Socket.IO Server (Real-time sync)                     │
│  ├── Email Service (Nodemailer/Resend)                     │
│  └── JWT Middleware (Authentication)                        │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                      │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                                │
│  ├── users (username, email, password, role, isVerified)   │
│  ├── boards (roomId, createdBy, elements, theme)           │
│  └── savedBoards (userId, roomId, boardName, elements)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### **1. User Authentication Flow**

```
User Registration:
1. User fills signup form → POST /api/auth/signup
2. Server validates data
3. Password hashed with bcrypt
4. User saved to MongoDB (isVerified: false for teachers)
5. If teacher → Email sent to admin for approval
6. JWT token generated and returned
7. User redirected to dashboard/verification page

User Login:
1. User enters credentials → POST /api/auth/login
2. Server validates credentials
3. Password compared with bcrypt
4. JWT token generated
5. User data + token returned
6. Token stored in localStorage
7. User redirected based on role (admin/teacher/student)
```

### **Google Sign-In Flow (Students Only)**

1. User clicks "Continue with Google" → Google Identity Services SDK obtains ID token.
2. Frontend sends token to `POST /api/auth/google-login`.
3. Server verifies token via Google UserInfo API.
4. If user exists with role `student`, generate JWT and return.
5. If user does not exist, auto‑register as a new `student` account, save to MongoDB, generate JWT.
6. JWT token returned to client, stored in localStorage, and user redirected to student dashboard.

### **2. Whiteboard Real-time Collaboration Flow**

```
Teacher Creates Board:
1. Teacher clicks "Create Board" → POST /api/boards
2. Server generates unique roomId
3. Board saved to MongoDB
4. Teacher redirected to /whiteboard/:roomId
5. Socket connection established
6. Teacher joins room via socket.emit('join-room')

Student Joins Board:
1. Student enters roomId → GET /api/boards/:roomId
2. Server validates board exists
3. Student redirected to /whiteboard/:roomId
4. Socket connection established
5. Student joins room via socket.emit('join-room')
6. Server emits 'sync-state' with current board elements

Real-time Drawing:
1. Teacher draws on canvas
2. Element created → socket.emit('draw-element')
3. Server broadcasts to all users in room
4. All clients receive 'draw-element' event
5. Canvas updated on all screens
6. Element saved to MongoDB

Other Real-time Events:
- cursor-move: Mouse position sync
- delete-element: Element deletion
- update-element: Element modification
- clear-canvas: Clear all elements
- theme-changed: Dark/light mode sync
- board-deleted: Board deletion notification
```

### **3. Admin Approval Flow**

```
Teacher Registration:
1. Teacher signs up
2. Email sent to admin (SMTP/Resend)
3. Teacher sees "Verification Pending" page

Admin Reviews:
1. Admin logs in → /admin
2. Sees pending teachers list
3. Can approve or reject

Approval:
1. Admin clicks "Approve" → POST /api/admin/approve/:id
2. User.isVerified set to true
3. Approval email sent to teacher
4. Teacher can now login and access dashboard

Rejection:
1. Admin clicks "Reject" → POST /api/admin/reject/:id
2. User deleted from database
3. Rejection email sent to teacher
```

---

## 🗂️ Database Schema

### **Users Collection**
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['student', 'teacher', 'admin']),
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### **Boards Collection**
```javascript
{
  _id: ObjectId,
  roomId: String (unique),
  createdBy: ObjectId (ref: 'User'),
  elements: Array, // Drawing elements
  darkMode: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **SavedBoards Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  roomId: String,
  boardName: String,
  elements: Array,
  darkMode: Boolean,
  savedAt: Date
}
```

---

## 🔌 API Endpoints

### **Authentication Routes** (`/api/auth`)
- `POST /signup` - User registration
- `POST /login` - User login

### **Board Routes** (`/api/boards`)
- `POST /` - Create new board
- `GET /:roomId` - Get board by roomId
- `PUT /:roomId` - Update board
- `DELETE /:roomId` - Delete board (teacher only)
- `DELETE /by-id/:boardId` - Delete board by ID

### **Saved Boards Routes** (`/api/saved-boards`)
- `POST /` - Save board to student dashboard
- `GET /user/:userId` - Get user's saved boards
- `DELETE /:id` - Delete saved board

### **Admin Routes** (`/api/admin`)
- `GET /pending-teachers` - Get pending teacher approvals
- `GET /all-teachers` - Get all teachers
- `GET /all-students` - Get all students
- `POST /approve/:id` - Approve teacher
- `POST /reject/:id` - Reject teacher
- `DELETE /users/:id` - Delete user

---

## 🎨 Key Features Implementation

### **1. Real-time Drawing**
- HTML5 Canvas API for rendering
- Pointer events for touch/mouse support
- WebSocket (Socket.IO) for real-time sync
- Optimized rendering with requestAnimationFrame
- Support for: Pen, Highlighter, Eraser, Shapes, Text, Sticky Notes, Images

### **2. Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Student, Teacher, Admin)
- Protected routes with middleware
- Email verification for teachers

### **3. Admin Panel**
- Teacher approval system
- User management (view, delete)
- Email notifications (approval/rejection)
- Statistics dashboard

### **4. Responsive Design**
- Mobile-first approach
- Tailwind-like utility classes
- Framer Motion animations
- Touch-friendly UI elements

---

## 🚀 Deployment Architecture

```
Frontend (Vercel):
- React app built with Vite
- Automatic deployment from GitHub
- Environment: VITE_API_BASE_URL

Backend (Render):
- Node.js Express server
- Automatic deployment from GitHub
- Environment variables:
  - MONGODB_URI
  - JWT_SECRET
  - SMTP credentials
  - RESEND_API_KEY
  - ADMIN_EMAIL
```

---

## 🔐 Security Features

1. **Password Security**
   - bcrypt hashing (10 salt rounds)
   - No plain text passwords stored

2. **Authentication**
   - JWT tokens with expiration
   - Token validation middleware
   - Role-based access control

3. **API Security**
   - CORS configuration
   - Input validation
   - MongoDB injection prevention (Mongoose)

4. **Environment Variables**
   - Sensitive data in .env files
   - .env files in .gitignore
   - Separate configs for dev/prod

---

## 📦 Project Structure

```
eduboard/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context (Theme)
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Backend Node.js app
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Email service
│   ├── utils/            # Utility functions
│   ├── config/           # Database config
│   ├── index.js          # Server entry point
│   └── package.json
│
└── .gitignore
```

---

## 🎯 User Roles & Permissions

### **Student**
- ✅ Join whiteboards with room code
- ✅ View and interact with board (read-only or edit based on teacher settings)
- ✅ Save boards to dashboard
- ❌ Cannot create boards
- ❌ Cannot delete boards

### **Teacher**
- ✅ Create unlimited whiteboards
- ✅ Full control over their boards
- ✅ Delete their own boards
- ✅ Toggle dark/light mode (syncs to students)
- ✅ Manage board permissions
- ❌ Cannot access admin panel

### **Admin**
- ✅ Approve/reject teacher registrations
- ✅ View all users (teachers & students)
- ✅ Delete any user
- ✅ Send email notifications
- ❌ Cannot create/join whiteboards
- ❌ Separate admin panel access

---

## 📝 Notes

This technical documentation provides a comprehensive overview of the EduBoard platform's architecture, implementation details, and deployment strategy.
