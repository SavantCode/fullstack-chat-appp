

## [1.2.3] - Fix Blank Screen After Auth Loading & Harden Store State

### Fixed
- **Blank Screen After Loading Spinner / Login**: Synchronized all store methods (`useChatStore.js` and `useThemeStore.js`) and date helpers (`formatSidebarTime`, `formatMessageTime`, `formatMessageDateLabel`, `extractLinksFromText` in `frontend/src/lib/utils.js`) with `Sidebar.jsx`, `ChatHeader.jsx`, `ChatContainer.jsx`, and `ContactDetailPanel.jsx`.
- **Safe `localStorage` Hydration**: Added `try/catch` and `Array.isArray()` / object structure validation when reading cached labels, per-user wallpapers, and favorites from `localStorage` so legacy cached values never crash React rendering.
- **Error Boundary Recovery (`frontend/src/App.jsx`)**: Added `AppErrorBoundary` and wildcard route fallback (`*`) so any unexpected runtime state provides a one-click cache reset instead of a blank screen.

---

## [1.2.2] - Fix Broken Seeded Image Attachments & Remove Background Wallpaper Blur

### Fixed
- **Broken Image Attachments**:
  - Created 4 local high-resolution SVG media preview graphics in `frontend/public/media/` (`dashboard-preview.svg`, `architecture-flow.svg`, `design-system.svg`, `sprint-metrics.svg`) and `twilight-wallpaper.svg` so seeded attachments and the Shared Media Grid load 100% reliably without external Unsplash failures.
  - Updated `backend/src/seeds/user.seed.js` to automatically migrate any existing `images.unsplash.com` attachment URLs in MongoDB to the local `/media/*.svg` assets.
  - Added `onError` fallback handlers to `<img>` tags in `ChatContainer.jsx` and `ContactDetailPanel.jsx`.
- **Unblurred Chat Background Wallpaper**:
  - Removed dark `linear-gradient` overlays from `CHAT_WALLPAPERS` and custom wallpaper URLs so background images display crisp and untouched.
  - Removed `backdrop-blur` filters from elements over the chat canvas in `ChatContainer.jsx`, `ChatHeader.jsx`, and `MessageInput.jsx`.

---

## [1.2.1] - Left Group Navigation Rail & Spacious Reference UI Polish

### Improved
- **Dedicated Left Navigation Rail (`frontend/src/components/Sidebar.jsx`, `frontend/src/pages/HomePage.jsx`, `frontend/src/App.jsx`)**:
  - Moved workspace group/label navigation onto the vertical Left Navigation Rail (with quick department badges, an expandable **Workspace Groups** drawer, and a bottom `+` creator button), completely eliminating the congested horizontal filter pill scrollbar.
  - Freed up 100% full-viewport width and height on the main workspace screen (`h-screen w-screen`) by hiding the redundant top navbar on `/`.
- **Clean, Uncongested Sidebar & Message Cards (`frontend/src/components/Sidebar.jsx`, `frontend/src/index.css`)**:
  - Added `.no-scrollbar` and `.thin-scrollbar` utilities to remove thick native scrollbars.
  - Designed the **"Online now"** 5-avatar strip with top-right status dots and `More >` toggle, followed by the **"Messages [Count]"** list with clean 2-line colleague rows (no duplicate role text).
- **Reference-Inspired Chat Bubbles & Header (`frontend/src/components/ChatHeader.jsx`, `frontend/src/components/ChatContainer.jsx`)**:
  - Added circular header action buttons and `••` read status dots + timestamps underneath chat bubbles.

---

## [1.2.0] - Modern Multi-Column Workspace UI, Custom Labels, Chat Wallpapers & Shared Media/Links Panel

### Added
- **Instagram & WhatsApp Style Chat Wallpapers (`frontend/src/constants/index.js`, `frontend/src/store/useThemeStore.js`, `ChatHeader.jsx`, `ContactDetailPanel.jsx`, `SettingsPage.jsx`)**:
  - Added 6 curated chat wallpaper & bubble themes (*Twilight Lake*, *Cyber Midnight*, *Berry Aurora*, *Emerald Mist*, *Alpine Starlight*, and *Minimal Adaptive*) plus custom wallpaper URL support.
  - Users can switch themes globally or per colleague from the chat header popover, right-hand detail panel, or Settings page.
- **Custom Colleague Grouping & Department Labels (`frontend/src/store/useChatStore.js`, `Sidebar.jsx`, `ContactDetailPanel.jsx`)**:
  - Designed for privacy-first colleague communication (no personal phone numbers required).
  - Pre-configured `#Dev`, `#Marketing`, `#Testing`, `#Design`, and `#Product` labels, plus the ability to create unlimited custom labels with automatic color coding and one-click sidebar filtering.
- **"Online Now" Horizontal Avatar Strip & Smart Filter Pills (`frontend/src/components/Sidebar.jsx`)**:
  - Added a top scrollable *Online Now* avatar bar for active colleagues and filter pills (*All chats*, *Unread*, *Pinned*, and `#Label` pills).
- **Right-Side Colleague Detail, Shared Media & Links Panel (`frontend/src/components/ContactDetailPanel.jsx`)**:
  - Displays colleague role, privacy badge, interactive custom label assignment, chat wallpaper selector, a `2x2` **Shared Media Grid** with `+N` overflow and full gallery view, and auto-extracted **Shared Links** from the conversation.
- **Rich Workplace Seed Data (`backend/src/seeds/user.seed.js`, `backend/src/models/user.model.js`)**:
  - Added `role`, `department`, and `labels` to the User model and seeded 15 workplace colleagues with realistic roles, shared images, and clickable links.

---

## [1.1.0] - Real-Time Typing Indicators, Unread Badges, Read Receipts, Reactions & Search

### Added
- **Live Typing Indicators**: Added `typing` / `stopTyping` Socket.IO relay in `backend/src/lib/socket.js` and animated typing status in `Sidebar.jsx`, `ChatHeader.jsx`, and `ChatContainer.jsx`.
- **Unread Message Badges & Last Message Previews**: Enriched `GET /api/messages/users` (`backend/src/controllers/message.controller.js`) with each contact's `lastMessage` snippet and `unreadCount`, sorting contacts dynamically by most recent activity.
- **Read Receipts (`✓` / `✓✓`)**: Added `isRead` field to `Message` model (`backend/src/models/message.model.js`), `PUT /api/messages/read/:id` endpoint, and real-time `messagesRead` Socket.IO event.
- **Message Reactions & Deletion**: Added `POST /api/messages/react/:messageId` and `DELETE /api/messages/:messageId` endpoints and hover toolbar in `ChatContainer.jsx`.
- **Full-Screen Image Lightbox & Quick Emoji Picker**: Added click-to-zoom image modal in `ChatContainer.jsx` and quick emoji selector in `MessageInput.jsx`.
- **Sidebar Contact Search & Editable Full Name**: Added instant search input in `Sidebar.jsx` and inline full name editing in `ProfilePage.jsx`.
- **Documentation**: Replaced stub `README.md` with comprehensive setup, architecture, demo credentials, and API documentation.

---

## [1.0.4] - Fix MongoDB Atlas TLS / IPv4 Handshake (`SSL alert number 80`)

### Fixed
- **MongoDB Connection (`backend/src/lib/db.js`)**: Added `family: 4` and `serverSelectionTimeoutMS: 10000` to `mongoose.connect()` to force IPv4 TLS negotiation with MongoDB Atlas and prevent OpenSSL `tlsv1 alert internal error: SSL alert number 80` on Windows/Node.js. Added a helpful diagnostic log if Atlas IP whitelisting blocks the connection.
- **Server Startup Sequence (`backend/src/index.js`)**: Updated server initialization to `await connectDB()` prior to `server.listen(PORT)` so incoming API requests do not hit Mongoose before the TLS connection is ready.

---

## [1.0.3] - Rich Demo Seed Data (Users & Multi-Turn Conversations)

### Added
- **`backend/src/seeds/user.seed.js`**: Upgraded the seed script to idempotently upsert all 15 demo users (hashed password: `123456`) and populate realistic multi-turn message histories (including image attachments and staggered timestamps) between demo contacts as well as any existing registered user accounts.
- **`backend/package.json`**: Added `"seed": "node src/seeds/user.seed.js"` script for one-command seeding.

---

## [1.0.2] - Comprehensive Bug Fixes Across Backend, Frontend & Real-Time Layer

### Fixed
- **`backend/src/index.js`**: Increased `express.json` and `express.urlencoded` body limits to `10mb` (and added default `PORT` fallback `5001`) so base64 image uploads in chat messages and profile updates no longer fail with `413 Payload Too Large`.
- **`backend/src/controllers/auth.controller.js`**:
  - Saved `newUser` to MongoDB before generating the JWT cookie in `signup`.
  - Excluded password hash (`.select("-password")`) in `updateProfile` response and returned `createdAt` in `signup` and `login` so "Member Since" displays immediately on the Profile page.
  - Added graceful Cloudinary fallback so profile image updates still work even when Cloudinary credentials are not yet configured.
- **`backend/src/controllers/message.controller.js`**:
  - Standardized all error JSON payloads from `{ error: ... }` to `{ message: ... }` to match frontend toast expectations.
  - Added validation preventing empty messages and added graceful Cloudinary fallback for chat image attachments.
- **`backend/src/middleware/auth.middleware.js`**: Handled `jwt.verify` exceptions (`JsonWebTokenError` / `TokenExpiredError`) with `401 Unauthorized` instead of `500 Internal server error`.
- **`backend/src/lib/socket.js`**: Tracked a `Set` of socket IDs per `userId` so multi-tab sessions and reconnections don't prematurely mark a user offline when a single tab closes, and emitted real-time messages to all open tabs of a user.
- **`backend/src/seeds/user.seed.js`**: Hashed all seed user passwords with `bcryptjs` before inserting into MongoDB and closed the database connection cleanly.
- **`frontend/public/avatar.svg` & UI Components (`Sidebar.jsx`, `ChatHeader.jsx`, `ChatContainer.jsx`, `ProfilePage.jsx`)**: Added a clean default vector avatar asset and `onError` fallbacks to eliminate broken avatar icons.
- **`frontend/src/store/useAuthStore.js` & `frontend/src/store/useChatStore.js`**:
  - Added safe optional chaining (`error.response?.data?.message || error.message`) in all `catch` blocks to prevent unhandled `TypeError` crashes.
  - Guarded `socket` listeners in `subscribeToMessages` and `unsubscribeFromMessages` against `null` sockets and duplicate listeners.
  - Cleared `selectedUser`, `messages`, and `users` state on `logout` so switching accounts never leaks the previous user's chat view.
- **`frontend/src/components/Sidebar.jsx`**: Fixed online user counter so it accurately counts online contacts and never displays `(-1 online)`.
- **`frontend/src/components/MessageInput.jsx`**: Enabled the image upload button on mobile viewports (`flex` instead of `hidden sm:flex`) and guarded `handleImageChange` when the file dialog is canceled.

---

## [1.0.1] - Environment Configuration Examples & Full App Analysis

### Added
- **`backend/.env.example`**: Added complete example environment configuration covering `PORT` (5001), `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- **`.env.example`**: Added root-level example environment file with documentation on how the frontend and backend ports/services connect.
