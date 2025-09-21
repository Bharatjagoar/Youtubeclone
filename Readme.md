# 🎬 YouTube Clone (Fullstack Edition)

A pixel-perfect, responsive YouTube clone built using **React**, **Redux Toolkit**, and the **YouTube Data API v3**, backed by a custom **Node.js + Express** server for authentication and comment management. Designed to mirror the real-world UI/UX of YouTube, with modular architecture and scalable state management.

---

## 🚀 Features

### 🏠 Home & Search
- Trending videos fetched via YouTube Data API
- Live search with debounced input and global Redux state
- Fallback UI for empty or failed queries

### 📺 Video Playback
- Dynamic routing to `/video/:videoId`
- Embedded video player with metadata (title, views, likes, channel info)
- Publish date formatting using `formatRelativeDate`

### 👤 Channel Page
- Dynamic routing to `/channel/:channelId`
- Channel metadata: banner, avatar, name, subscriber count, video count
- Description cleanup using `cleanText` and truncation
- Channel videos fetched via `playlistItems` from `uploads` playlist
- Responsive video grid layout using CSS Grid

### 🔐 Authentication (Backend)
- Signup and login via `/auth/signup` and `/auth/login`
- JWT-based token issuance and verification (`/auth/verify-token`)
- Frontend stores token and verifies before protected actions
- Server-side validation ensures secure access control

### 💬 Comment System (Backend)
- Post comments: `POST /comments`
- Reply to comments: `POST /comments/:parentId/replies`
- Fetch comments by video: `GET /comments/video/:videoId`
- Edit comment: `PUT /comments/:commentId`
- Delete comment and nested replies: `DELETE /comments/:commentId`
- Recursive backend logic ensures clean deletion and updates

### 🎨 UI & UX Enhancements
- Responsive design with `auto-fit`, `minmax`, and `clamp()`
- Scroll-free layout and adaptive spacing
- YouTube-like modal transitions, hover effects, and typography
- Error handling with graceful fallbacks

---

## 🧠 Helper Functions

- `formatCount(num)` – Converts large numbers to readable formats (e.g., 1.2M)
- `formatRelativeDate(date)` – Converts timestamps to "X days ago"
- `cleanText(text)` – Removes emojis and hashtags from descriptions
- `truncate(text, maxLength)` – Limits text overflow in UI

---

## 🔧 APIs Used

| Endpoint         | Purpose                                      |
|------------------|----------------------------------------------|
| `channels`       | Fetch channel metadata, banner, stats        |
| `playlistItems`  | Fetch videos from channel's uploads playlist |
| `videos`         | Get individual video details                 |
| `search`         | Keyword-based search results                 |
| `/auth/*`        | Signup, login, and JWT verification          |
| `/comments/*`    | Full comment CRUD with nested reply support  |

---

## 🛠 Tech Stack

### Frontend
- **React** with functional components and hooks
- **Redux Toolkit** for global state management
- **React Router v6** for nested routing
- **Axios** for API calls
- **Vite** for fast dev environment
- **CSS Grid & Flexbox** for layout
- **YouTube Data API v3** for real content

### Backend
- **Node.js + Express**
- **MongoDB** (via `connectDB()` in config)
- **JWT** for secure authentication
- **RESTful routes** for auth and comments
- **dotenv** for environment config

---

## 🧪 Future Enhancements

- Tab navigation on channel page (*Videos*, *Playlists*, *About*)
- Verified badge and subscribe button animation
- Filter options for search (duration, relevance, type)
- Playlist support and community tab
- Like/dislike system with backend persistence

---

## 📜 License

MIT — feel free to fork, remix, and build on top of it.

---

