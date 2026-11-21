# 💬 Chatty — Full-Stack Real-Time Messaging Application

Chatty is a modern, full-stack real-time chat application built with **React 18 (Vite)**, **Zustand**, **Tailwind CSS + DaisyUI (32 themes)**, **Node.js / Express**, **Socket.IO**, **MongoDB (Mongoose)**, and **Cloudinary**.

---

## ✨ Key Features

- 🔐 **JWT Cookie Authentication**: Secure signup, login, logout, and protected API routes using `httpOnly`, `sameSite: "strict"` cookies and `bcryptjs` password hashing.
- ⚡ **Real-Time Messaging (Socket.IO)**: Instant bi-directional message delivery across multiple open tabs/devices per user.
- ✍️ **Live Typing Indicators**: Real-time `"typing..."` indicators in both the conversation header, message stream, and contact sidebar.
- 🔔 **Unread Message Badges & Toast Alerts**: Live unread message counters in the sidebar, last-message snippet previews, automatic contact sorting by latest activity, and in-app toast notifications when a background contact messages you.
- ✅ **Read Receipts (`✓` / `✓✓`)**: Real-time single checkmark (Sent) and double checkmark (Read) indicators synced via Socket.IO.
- 😍 **Emoji Reactions & Message Deletion**: React to any message with quick emojis (`👍 ❤️ 😂 😮 😢 🔥`) or delete your own sent messages in real time.
- 🖼️ **Photo Sharing & Full-Screen Lightbox**: Send images (with Cloudinary upload + automatic base64 fallback) and click any image to inspect it in a full-screen zoom modal.
- 🔍 **Contact Search & Online Presence**: Filter contacts by name/email or toggle *"Show online only"*.
- 🎨 **32 Customizable Themes**: Instant theme switching powered by DaisyUI & Tailwind CSS, persisted in `localStorage`.

---

## 📸 Screenshots

![Chat Interface](https://github.com/user-attachments/assets/22817342-ed51-4686-85e6-1100991bb68f)
![Theme Switcher](https://github.com/user-attachments/assets/0ca97b36-2504-42d0-8ee1-14c77fae1aea)
![Profile Page](https://github.com/user-attachments/assets/fc7fab1b-c51a-4c4b-bd0b-9ca5063e039b)

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Zustand, React Router v6, Axios, Socket.IO Client, Tailwind CSS, DaisyUI, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose (MongoDB), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Cloudinary SDK |

---

## 🚀 Getting Started

### 1. Configure Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your credentials:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/chatty_db
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> **Note**: If Cloudinary credentials are omitted or left as placeholders during local development, Chatty automatically falls back to storing base64 data URIs so image uploads still work out of the box.

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

### 3. Seed Demo Contacts & Conversations (Optional)

Populate MongoDB with **15 realistic demo users** and multi-turn conversations (including photo attachments):

```bash
npm run seed --prefix backend
```

**Demo Login Credentials** (Password for all seeded users: `123456`):
- `emma.thompson@example.com` / `123456`
- `james.anderson@example.com` / `123456`
- `olivia.miller@example.com` / `123456`
- `sophia.davis@example.com` / `123456`

### 4. Run in Development Mode

```bash
# Terminal 1: Start Backend (http://localhost:5001)
npm run dev --prefix backend

# Terminal 2: Start Frontend (http://localhost:5173)
npm run dev --prefix frontend
```

---

## 📡 API Overview

### Auth Routes (`/api/auth`)
- `POST /api/auth/signup` — Register a new user account
- `POST /api/auth/login` — Authenticate user and issue `jwt` cookie
- `POST /api/auth/logout` — Clear `jwt` cookie
- `PUT /api/auth/update-profile` — Update `profilePic` and/or `fullName`
- `GET /api/auth/check` — Verify current session

### Message Routes (`/api/messages`)
- `GET /api/messages/users` — Get all contacts enriched with `lastMessage` and `unreadCount`
- `GET /api/messages/:id` — Fetch conversation history with user `:id` and mark unread messages as read
- `POST /api/messages/send/:id` — Send a text/image message to user `:id`
- `PUT /api/messages/read/:id` — Mark messages from user `:id` as read
- `POST /api/messages/react/:messageId` — Toggle an emoji reaction on a message
- `DELETE /api/messages/:messageId` — Delete a message sent by the current user