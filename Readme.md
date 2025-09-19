# 🎬 YouTube Clone (Frontend Focus)

A pixel-perfect, responsive YouTube clone built using React, Redux Toolkit, and the YouTube Data API v3. Designed to mirror the real-world UI/UX of YouTube, with modular architecture and scalable state management.

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

### 🔐 Authentication
- Global sign-in modal controlled via Redux
- Pre-prompt modals for protected actions (e.g., comment, like)
- JWT-based auth checks before sensitive API calls
- Server-side token verification enforced

### 💬 Comment System
- Auth-gated posting of comments and replies
- Real-time UI updates on post/edit/delete
- Recursive backend logic for nested replies

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
| `auth` (custom)  | JWT-based access control                     |

---

## 🛠 Tech Stack

- **React** with functional components and hooks
- **Redux Toolkit** for global state management
- **React Router v6** for nested routing
- **Axios** for API calls
- **Vite** for fast dev environment
- **CSS Grid & Flexbox** for layout
- **YouTube Data API v3** for real content

---

## 📁 Folder Structure (Simplified)