# 🎬 MOVIE BOOKING SYSTEM - INTERVIEW PREPARATION GUIDE

---

## 📋 PROJECT OVERVIEW

This is a **full-stack MERN (MongoDB, Express, React, Node) application** for movie ticket booking with real-time features and payment integration.

**Tech Stack:**
- Frontend: React 19 + Vite + Tailwind CSS
- Backend: Node.js + Express + Socket.io
- Database: MongoDB Atlas
- Payment: Razorpay
- Cloud Storage: Cloudinary

---

## 🏗️ ARCHITECTURE LAYERS

```
Frontend (React + Vite)  →  Backend (Express + Node)  →  Database (MongoDB)
                         ↓
                    Socket.io (Real-time)
```

---

## 🔄 PROJECT FLOW - What Happens When User Books a Ticket

### **STEP 1: USER REGISTRATION/LOGIN** (Authentication)
- User fills form → React sends data to backend
- Backend validates with `express-validator`
- Password hashed with `bcryptjs` (one-way encryption)
- JWT token created and sent back to frontend
- Token stored in localStorage (client-side)
- Every API call includes this token for verification

**Why?** → Secure authentication without storing passwords in plain text

---

### **STEP 2: BROWSE MOVIES & SHOWS**
- Frontend calls `/api/movies` (GET request)
- Backend queries MongoDB for all movies
- Images come from **Cloudinary** (cloud storage)
- Returns data to frontend
- React displays theaters, movies, and available shows

---

### **STEP 3: SEAT SELECTION** (Real-time Magic ✨)

**Problem:** Multiple users selecting same seat simultaneously = double booking

**Solution:** Socket.io Real-time Locking

```javascript
When User A selects seat 5:
  → Emit event via Socket.io: "lock_seat"
  → Server locks seat in global.lockedSeats map
  → Server broadcasts to ALL other users in that show
  → User B sees seat 5 is "locked" (greyed out)
  → User B cannot select it
  → If User A closes browser → seat automatically unlocks
```

**Why Socket.io?** → WebSocket = instant two-way communication (better than REST API polling)

**Data Structure:**
```javascript
global.lockedSeats = new Map()
// showId → seatId → { socketId, status (selected | locked), timestamp }
```

---

### **STEP 4: PAYMENT** (Razorpay Integration)
- User clicks "Pay"
- Razorpay checkout opens (secure payment gateway)
- User enters card/UPI details
- Razorpay processes payment
- Returns success/failure to backend
- Backend creates booking in MongoDB
- Frontend shows confirmation

**Why Razorpay?** → PCI compliance (safe for card data, not your server)

---

### **STEP 5: BOOKING CONFIRMATION**
- Booking record saved with:
  - User ID
  - Show ID
  - Selected seats
  - Amount paid
  - Timestamp
- User can view booking history anytime

---

## ⚙️ KEY CONFIGURATION FILES

### **Backend (`server/.env`)**
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
  → Connection string to MongoDB Atlas cloud database

JWT_SECRET=your_secret_key_here
  → Used to sign/verify JWT tokens (like password for tokens)

CLOUDINARY_NAME, API_KEY, API_SECRET
  → Credentials to upload/store images in cloud

RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
  → API credentials for payment processing

FRONTEND_URL=http://localhost:5173
  → CORS configuration (which domains can access backend)

PORT=5000
  → Server runs on this port
```

### **Frontend (`client/package.json`)**
- **React 19** → UI library
- **Vite** → Fast build tool (10x faster than Webpack)
- **Tailwind CSS** → Styling framework
- **axios** → HTTP requests to backend
- **react-router-dom** → Page navigation

### **Backend (`server/package.json`)**
- **Express** → Web framework for APIs
- **mongoose** → MongoDB interaction (ORM)
- **bcryptjs** → Password hashing
- **jsonwebtoken** → JWT token creation
- **cors** → Allow frontend to call backend
- **multer** → File upload handling
- **cloudinary** → Image storage in cloud
- **razorpay** → Payment processing
- **socket.io** → Real-time communication

---

## 📁 PROJECT STRUCTURE & EXPLANATION

```
server/
├── config/
│   └── db.js                  → MongoDB connection logic
│                                (Separated for reusability)
│
├── middleware/
│   └── authMiddleware.js      → Verify JWT on protected requests
│                                (Checks if user is authenticated)
│
├── models/
│   ├── User.js                → User schema (name, email, password)
│   ├── Movie.js               → Movie schema (title, poster, description)
│   ├── Show.js                → Show schema (movie + theater + time)
│   ├── Booking.js             → Booking schema (user + show + seats)
│   └── Theater.js             → Theater schema (name, layout, capacity)
│
├── routes/
│   ├── auth.js                → /auth/login, /auth/register
│   ├── movies.js              → /api/movies (get all movies)
│   ├── shows.js               → /api/shows (get shows for movie)
│   ├── theaters.js            → /api/theaters (theater details)
│   ├── payment.js             → /api/payment (payment endpoints)
│   ├── admin.js               → /api/admin (admin operations)
│   └── upload.js              → /api/upload (image upload)
│
└── server.js                  → Main file (starts server + Socket.io)

client/
├── src/
│   ├── App.jsx                → Main app component
│   ├── main.jsx               → React entry point
│   ├── index.css              → Global styles
│   │
│   ├── components/
│   │   ├── Navbar.jsx         → Navigation bar
│   │   ├── ProtectedRoute.jsx → Ensures user is logged in
│   │   ├── AdminRoute.jsx     → Ensures user is admin
│   │   └── VisualTheaterEditor.jsx → Theater layout visualization
│   │
│   ├── context/
│   │   └── AuthContext.jsx    → Global auth state (login/user info)
│   │
│   ├── lib/
│   │   └── api.js             → Axios instance for API calls
│   │
│   └── pages/
│       ├── LoginPage.jsx      → User login
│       ├── RegisterPage.jsx   → User registration
│       ├── LandingPage.jsx    → Home page
│       ├── MoviesPage.jsx     → List all movies
│       ├── TheatreListPage.jsx → List all theaters
│       ├── SeatSelectionPage.jsx → Pick seats (real-time)
│       ├── MyBookingsPage.jsx → View booking history
│       ├── ProfilePage.jsx    → User profile
│       └── AdminDashboard.jsx → Admin controls
```

**Why Separated?** → MVC pattern - each file has ONE responsibility

---

## 🔑 KEY TECHNOLOGY CHOICES & WHY

| Technology | Why? |
|-----------|------|
| **MongoDB** | No fixed schema, scales easily, JSON-like documents |
| **JWT** | Stateless auth (server doesn't store sessions), scalable |
| **Socket.io** | Real-time bi-directional communication for seat locking |
| **Cloudinary** | Don't overload server with images, CDN delivery |
| **Razorpay** | Payment processing (PCI compliant, secure) |
| **React** | Component-based, reusable UI, large ecosystem |
| **Vite** | 10x faster than Webpack for development |
| **Tailwind CSS** | Utility-first CSS, fast styling |

---

## 💡 INTERVIEW TALKING POINTS

### **Q1: How do you prevent double booking when multiple users select same seat?**
**Answer:** "We use Socket.io WebSockets to lock seats in real-time. When User A selects a seat, we:
1. Store seat lock in `global.lockedSeats` Map with timestamp
2. Emit 'sync_locked_seats' event to all connected users in that show
3. User B sees seat as locked/unavailable immediately
4. If User A's connection drops, seat auto-unlocks after timeout

This ensures no race condition since all seat changes go through single server."

---

### **Q2: How is user data secured?**
**Answer:** "Security is implemented at multiple levels:
1. **Passwords:** Hashed with bcryptjs (one-way encryption) before storing in DB
2. **Authentication:** JWT tokens issued after login
3. **Authorization:** JWT middleware verifies every API request
4. **Payment:** Card data never touches our server - handled by Razorpay
5. **Images:** Stored in Cloudinary, not in our database
6. **CORS:** Backend configured to accept requests only from frontend URL"

---

### **Q3: How do images work? Why not store in database?**
**Answer:** "Images are uploaded to Cloudinary instead of our server:
- **Why?** Reduces server storage, images can be cached globally via CDN
- **How?** When user uploads, multer intercepts, cloudinary-storage sends to Cloudinary, gets secure URL back
- **Benefits:** Faster loading times, scalable, secure, reduces server load
- **CORS:** Cloudinary URLs accessible from anywhere"

---

### **Q4: Why separate frontend and backend? Why not monolith?**
**Answer:** "Separation gives us:
- **Scalability:** Frontend on CDN, backend on app server, database separate
- **Technology flexibility:** Can swap frontend framework without touching backend
- **Team collaboration:** Frontend team and backend team work independently
- **Deployment:** Can update frontend without restarting backend servers
- **Performance:** Frontend cached, backend optimized for logic"

---

### **Q5: How is payment security handled?**
**Answer:** "Payment security is handled by Razorpay (PCI compliant):
- User fills payment form in Razorpay hosted checkout (not our form)
- Credit card data never touches our server
- Razorpay returns payment status to backend via webhook
- We create booking only after webhook confirms success
- This way, we're never responsible for card data security"

---

### **Q6: Tell me technical details of seat locking**
**Answer:** "Seat locking works like this:

1. **Join Show:** User joins show room via Socket.io
   ```javascript
   socket.on('join_show', (showId) => {
     socket.join(showId); // Join Socket.io room
     const locks = Array.from(global.lockedSeats.get(showId) || new Map());
     socket.emit('sync_locked_seats', locks); // Send current locks
   });
   ```

2. **Lock Seat:** User selects seat
   ```javascript
   socket.on('lock_seat', (showId, seatId) => {
     global.lockedSeats.set(showId → seatId → {socketId, status, timestamp});
     io.to(showId).emit('seat_locked', {seatId, status}); // Broadcast
   });
   ```

3. **Unlock Seat:** User leaves or payment fails
   ```javascript
   socket.on('disconnect', () => {
     // Find all seats locked by this socket
     // Remove them from global.lockedSeats
     // Broadcast unlock to other users
   });
   ```

This ensures consistency across all connected clients."

---

### **Q7: What happens if user closes browser after selecting seats?**
**Answer:** "Socket.io automatically detects disconnection:
1. Connection drops
2. 'disconnect' event fired on server
3. We find all seats locked by that socket
4. Remove them from `global.lockedSeats`
5. Broadcast 'seat_unlocked' to other users in show
6. Seats become available again for others"

---

### **Q8: How does user authentication work end-to-end?**
**Answer:** "1. User enters email/password on login page
2. React submits to `/api/auth/login`
3. Backend validates email exists
4. Compares password with hashed password using bcryptjs.compare()
5. If match, creates JWT token with userId inside
6. Token sent back to frontend, stored in localStorage
7. Subsequent API calls include token in Authorization header
8. Backend middleware verifies token on every request
9. Middleware adds user info to request object for route handlers"

---

### **Q9: What would break if users increased 10x? How to fix?**
**Answer:** "Potential bottlenecks:
- **Socket.io server:** Can't handle 10x connections
  - Fix: Use Redis for pub/sub (horizontal scaling)
  - Fix: Deploy multiple Socket.io servers behind load balancer
  
- **Database:** Queries might slow down
  - Fix: Add indexes on frequently queried fields
  - Fix: Use read replicas for read-heavy operations
  
- **Server memory:** Global.lockedSeats might grow too large
  - Fix: Auto-cleanup seats with expired timestamps
  - Fix: Move to Redis instead of in-memory Map

- **Cloudinary:** Rate limits
  - Fix: Implement caching, CDN caching"

---

### **Q10: How do you handle payment failures?**
**Answer:** "When payment fails:
1. Razorpay webhook returns failure status
2. We don't create booking record
3. Seats remain locked for a timeout period (user can retry)
4. Or we auto-unlock if user closes browser
5. Frontend shows error: 'Payment failed, try again'
6. User can retry payment from booking page
7. No money charged if payment fails"

---

### **Q11: How do you prevent unauthorized access?**
**Answer:** "Multiple layers:
1. **Authentication:** Must login to get JWT token
2. **ProtectedRoute:** Frontend doesn't show pages without token
3. **AuthMiddleware:** Backend checks JWT on protected endpoints
4. **Authorization:** Check user has permission (admin only for admin routes)
5. **CORS:** Only allow requests from frontend URL
6. **Rate limiting:** (Could implement) Limit login attempts to prevent brute force"

---

### **Q12: What's the data flow for a booking?**
**Answer:** "1. User selects seats → Socket.io locks them
2. User clicks Pay → Frontend calls `/api/payment/create`
3. Backend creates Razorpay order, sends order ID
4. Frontend opens Razorpay checkout with order ID
5. User pays → Razorpay redirects to verification
6. Razorpay sends webhook to backend with payment status
7. Backend verifies signature, if valid:
   - Creates Booking document in MongoDB
   - Releases seat locks (permanent booking now)
   - Sends confirmation to frontend
8. Frontend shows 'Booking Confirmed'"

---

## 📊 DATABASE MODELS

### **User Model**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcryptjs),
  phone: String,
  isAdmin: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### **Movie Model**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  genre: [String],
  rating: Number,
  posterUrl: String (from Cloudinary),
  releaseDate: Date,
  createdAt: Date
}
```

### **Show Model**
```javascript
{
  _id: ObjectId,
  movieId: ObjectId (ref to Movie),
  theaterId: ObjectId (ref to Theater),
  showTime: DateTime,
  price: Number,
  totalSeats: Number,
  occupiedSeats: Number,
  createdAt: Date
}
```

### **Booking Model**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref to User),
  showId: ObjectId (ref to Show),
  seatsBooked: [String] (e.g., ["A1", "A2"]),
  amount: Number,
  paymentId: String (from Razorpay),
  status: String (confirmed/cancelled),
  bookedAt: Date
}
```

### **Theater Model**
```javascript
{
  _id: ObjectId,
  name: String,
  location: String,
  city: String,
  seatLayout: Array (2D array of seats),
  totalCapacity: Number,
  createdAt: Date
}
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

```
Production Setup:

Frontend:
  - Build with Vite: npm run build
  - Deploy to Vercel/Netlify
  - CDN caches static assets
  - Environment: VITE_API_URL=https://api.production.com

Backend:
  - Deploy to Heroku/Railway/Render
  - Auto-scale based on load
  - Environment variables in .env (secrets)
  - Runs on PORT 5000

Database:
  - MongoDB Atlas (cloud, always available)
  - Automated backups
  - Read replicas for scaling

Storage:
  - Cloudinary handles all images
  - CDN globally distributed
  - No server storage needed
```

---

## 🎯 QUICK SUMMARY FOR INTERVIEWS

**3 Resume Bullet Points:**

• Built full-stack MERN movie booking app with real-time seat selection (Socket.io), JWT auth, and Razorpay payments

• Developed Node.js/Express backend with MongoDB, RESTful APIs, Cloudinary image storage, and validation middleware

• Created React + Vite frontend with admin dashboard, theater seat picker, and booking management system

---

## 📝 COMMON FOLLOW-UP QUESTIONS

**Q: What's your role in this project?**
A: "I built the full-stack application including real-time seat selection using Socket.io, payment integration with Razorpay, JWT authentication, and admin dashboard for content management."

**Q: What was the most challenging part?**
A: "Implementing real-time seat locking with Socket.io to prevent race conditions when multiple users book simultaneously. Had to ensure consistency across all connected clients without double-booking."

**Q: What would you do differently now?**
A: "I'd implement Redis for scalability, add comprehensive error handling, implement automated tests, add rate limiting, and use socket.io namespaces for better organization."

**Q: How do you handle concurrent requests?**
A: "Socket.io ensures single point of truth for seat locks. Express handles concurrent HTTP requests using Node's event loop and clustering. MongoDB handles concurrent database writes."

**Q: Did you handle all edge cases?**
A: "Key ones covered: connection drops (auto-unlock), payment failures (no booking created), user logout (seat release), concurrent seat selection (Socket.io prevents). Could add better error notifications and retry mechanisms."

---

## ✅ PRE-INTERVIEW CHECKLIST

- [ ] Understand full user flow from login to booking confirmation
- [ ] Know what each technology (React, Express, MongoDB, etc.) does
- [ ] Practice explaining Socket.io seat locking
- [ ] Know the difference between REST and WebSocket
- [ ] Understand JWT authentication flow
- [ ] Know why Razorpay for payments (PCI compliance)
- [ ] Be ready to discuss scaling challenges
- [ ] Practice the 3 resume bullet points

---

**Good luck with your interviews! 🚀**

Remember: Don't memorize, understand the concepts. Interviewers want to see you THINK, not recite.
