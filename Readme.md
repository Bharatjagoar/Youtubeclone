# 🎬 YouTube Clone (Fullstack Edition)

A fullstack **YouTube clone** built with **React, Redux Toolkit, Node.js, Express, and MongoDB**, featuring a pixel-perfect UI, modular architecture, and scalable backend APIs.
Supports **channel creation, video uploads, comments, likes, and trending discovery**, with Cloudinary for media storage.

---

---

## 📹 Demo Video

Watch the full project demonstration here:

**[View Demo Video](https://drive.google.com/file/d/15FfrYUw3cIzTgA2MKNzMtcO7_VVvSfsH/view?usp=sharing)**

---

## 🚀 Features

### 🎨 UI Components & Layout

* Persistent layout with header, sidebar, and content area.
* Responsive design using CSS Grid & Flexbox.
* Video cards grid with hover effects, view/date formatting, and truncation.

### 👤 User & Channel Management

* Avatar system with initials fallback + Cloudinary upload integration.
* Avatar dropdown menu with contextual options (View Channel, Logout).
* Create/Edit Channel modal (auto-trigger if no channel exists).
* Title + description fields with validation & error handling.
* Delete channel (owner-only).

### 📹 Video Upload & Display

* Upload Video modal with title, description, thumbnail, and video file input.
* Backend-ready integration with Cloudinary/local storage.
* Video player page with:
  * Embedded player.
  * Like button.
  * Edit/Delete options for owner.
  * Channel info & related videos sidebar.

### 💬 Comment System

* Recursive comment/reply rendering with indentation.
* Add, edit, delete for comments & replies.
* Optimistic UI updates.
* Backend recursive deletion to prevent orphaned replies.

### 🔍 Navigation & Discovery

* Header search bar integrated with Redux slice.
* Trending page with infinite scroll & loading indicators.
* Navigation between home, trending, channel, and video pages.

### 🔐 Authentication

* Signup and login via `/auth/signup` and `/auth/login`.
* JWT-based authentication & token verification middleware.
* Auth-protected actions (upload, edit, delete, comment).

---

## 🗂 Folder Structure

```
YoutubeClone/
├── backend/                    # Node.js + Express backend
│   ├── config/                 # DB connection & environment setup
│   ├── controllers/            # Route logic for auth, channels, videos, comments
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express route definitions
│   ├── .env                    # Backend environment variables
│   ├── index.js                # Entry point
│   ├── package.json            # Backend dependencies
│   └── package-lock.json
│
├── frontend/                   # React + Vite frontend
│   ├── public/                 # Static assets
│   ├── src/                    # React components, pages, slices, utils
│   ├── .env                    # Frontend environment variables
│   ├── eslint.config.js        # Linting rules
│   ├── vite.config.js          # Vite bundler config
│   ├── package.json            # Frontend dependencies
│   └── package-lock.json
│
├── node_modules/               # Root dependencies (if any)
├── .gitignore                  # Git ignored files
├── README.md                   # Project documentation
└── package.json                # Root-level scripts (optional)
```

---

## 🛠 Tech Stack

### Frontend

* **React** (functional components + hooks)
* **Redux Toolkit** (state management)
* **React Router v6** (routing)
* **Axios** (API requests)
* **Vite** (bundler)
* **CSS Grid & Flexbox** (responsive design)

### Backend

* **Node.js + Express**
* **MongoDB + Mongoose**
* **JWT** (authentication)
* **Cloudinary** (media storage)
* **RESTful APIs** for auth, channels, videos, and comments

---

## 📦 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
* **MongoDB** (local installation or MongoDB Atlas account) - [Get started](https://www.mongodb.com/)
* **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Bharatjagoar/Youtubeclone.git
cd youtube-clone
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd backend
```

#### 2.2 Install Backend Dependencies

```bash
npm install
```

#### 2.3 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Add the following variables to `.env`:

```env
# Server Configuration
PORT=5000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/youtube-clone
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/youtube-clone

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Cloudinary Configuration (optional for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### 2.4 Start Backend Server

```bash
npm start
```

The backend server should now be running on `http://localhost:5000`

---

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory

Open a new terminal window/tab and navigate to the frontend directory:

```bash
cd frontend
```

#### 3.2 Install Frontend Dependencies

```bash
npm install
```

#### 3.3 Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
touch .env
```

Add the following variables to `.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# YouTube Data API v3 (for fetching trending videos)
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# Cloudinary Configuration (for avatar/media uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

#### 3.4 Start Frontend Development Server

```bash
npm start
```

The frontend application should now be running on `http://localhost:3000`

---

### Step 4: Verify Installation

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the YouTube clone homepage
3. Try signing up for a new account
4. Create a channel and explore the features

---

## 🔑 Getting API Keys

### YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**
4. Go to **Credentials** and create an **API Key**
5. Copy the API key to your frontend `.env` file

### Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to your dashboard
3. Copy your **Cloud Name**, **API Key**, and **API Secret**
4. Create an **Upload Preset**:
   * Go to Settings → Upload
   * Scroll to "Upload presets"
   * Click "Add upload preset"
   * Set signing mode to "Unsigned"
   * Save and copy the preset name
5. Add these values to both frontend and backend `.env` files

---

## 🧠 Helper Functions

* `formatCount(num)` → Converts numbers into readable format (e.g., 1.2M).
* `formatRelativeDate(date)` → Displays timestamps like "3 days ago."
* `cleanText(text)` → Removes emojis/hashtags from text.
* `truncate(text, maxLength)` → Prevents overflow with ellipsis.

---

## 🚨 Common Issues & Troubleshooting

### MongoDB Connection Error

**Error:** `MongoNetworkError` or connection timeout

**Solution:**
* Ensure MongoDB is running locally: `mongod` or `brew services start mongodb-community` (macOS)
* Check your `MONGODB_URI` in backend `.env`
* For MongoDB Atlas, ensure your IP address is whitelisted

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
* Kill the process using the port: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)
* Or change the `PORT` in backend `.env`

### CORS Issues

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
* Verify backend CORS configuration allows frontend origin
* Check that `VITE_API_URL` in frontend `.env` matches backend URL

### API Rate Limits

**Warning:** YouTube API and Cloudinary have daily quotas

**Solution:**
* Monitor your API usage in respective dashboards
* Implement caching for frequently accessed data
* Consider upgrading to paid tiers for production use

---

## ⚠️ Danger Zone (Important Notes)

This project uses **YouTube Data API v3** and **Cloudinary API**, both of which have **rate limits**.

* If you're evaluating or testing the app, hitting these limits may cause API failures (e.g., blank video results, failed uploads).
* **Solution:** A `.env` file is required to provide valid API keys.
  * For security, the `.env` is **not committed to GitHub**.
  * It is available in the folder locally.

---

## 🏗️ Building for Production

### Backend Production Build

```bash
cd backend
# Ensure all environment variables are set for production
npm start
```

Consider using PM2 for process management:

```bash
npm install -g pm2
pm2 start index.js --name youtube-clone-backend
```

### Frontend Production Build

```bash
cd frontend
npm run build
```

The production-ready files will be in the `frontend/dist` directory. Serve them using:

```bash
npm run preview
```

Or deploy to platforms like Vercel, Netlify, or AWS S3.

---

## 🧪 Future Enhancements

* Subscriptions & notifications system.
* Playlists & watch later.
* Advanced search filters (duration, relevance, type).
* Verified badges and subscribe button animations.
* Admin/moderator roles with extended access control.
* Video recommendations algorithm.
* Live streaming capabilities.
* Dark mode theme toggle.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

MIT — feel free to fork, remix, and build on top of it.

---

## 👨‍💻 Author

Built with ❤️ by JAG

For questions or support, please open an issue on GitHub.

---

**Happy Coding! 🚀**