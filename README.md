# Vault Gate - Secure API Gateway with React Frontend

A complete full-stack application demonstrating secure API gateway usage, rate limiting, and role-based access control with a professional React UI.

## Project Structure

```
Vault_Gate/
├── backend/          # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.route.js      # Login/Register
│   │   │   ├── api.route.js       # Payment, Balance, Activity
│   │   │   └── admin.route.js     # Admin metrics & monitoring
│   │   ├── controllers/
│   │   ├── middleware/            # JWT authentication
│   │   ├── models/                # User model
│   │   └── app.js
│   └── package.json
│
└── frontend/         # React + Vite + Tailwind CSS
    ├── src/
    │   ├── components/            # Layout & Route Guards
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── user/               # User Dashboard Pages
    │   │   └── admin/              # Admin Dashboard Pages
    │   ├── contexts/               # Auth Context
    │   ├── utils/                  # Axios, Auth utilities
    │   └── App.jsx
    └── package.json
```

## Features

### User Dashboard (CLIENT PORTAL)
- **Dashboard Overview** - View account stats and API metrics
- **Make Payment** - Send payments through secure gateway (shows 429 on rate limit)
- **Check Balance** - Fetch account balance via API
- **Spam Requests** - Simulate attack to trigger rate limiting (educational)
- **Activity History** - View all API interactions

### Admin Dashboard (SECURITY OPERATOR)
- **Overview Dashboard** - Real-time metrics on total requests, blocked, rate-limited
- **API Traffic Monitoring** - Per-endpoint statistics with success rates
- **Suspicious Activity Logs** - Track rate limit violations and security events
- **System Health** - Monitor gateway status

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install

# Create .env file with:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/vault_gate
# JWT_SECRET=your_secret_key_here

npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install

# .env is already configured with:
# VITE_API_URL=http://localhost:5000

npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - Create account (returns API key)
- `POST /auth/login` - Login with username + API key (returns JWT)

### User APIs (Protected)
- `GET /api/balance` - Get account balance
- `POST /api/payment` - Make payment
- `GET /api/test-endpoint` - Test endpoint with rate limiting
- `GET /api/user/activity` - Get user activity logs

### Admin APIs (Admin only)
- `GET /api/admin/metrics` - System metrics & stats
- `GET /api/admin/traffic` - Per-endpoint traffic data
- `GET /api/admin/suspicious-activity` - Security events log

## Rate Limiting Features

- **Threshold**: 10 requests per minute per user
- **Rate Limit Response**: HTTP 429 (Too Many Requests)
- **Block Duration**: 15 minutes after exceeding threshold
- **Block Response**: HTTP 403 (Forbidden)

### Testing Rate Limiting
1. Sign up for an account
2. Login as user
3. Go to "Spam Requests" page
4. Click "Start Attack"
5. Watch requests succeed initially, then get rate limited (429), then blocked (403)

## Authentication Flow

1. **User Registration**: Creates account and generates API key
2. **User Login**: Uses username + API key → receives JWT token
3. **Token Storage**: JWT stored in localStorage
4. **Axios Interceptor**: Automatically attaches token to all requests
5. **Role-Based Routing**: 
   - Regular users → User Dashboard
   - Admins → Admin Dashboard
6. **Token Expiration**: 1 hour (auto-logout on 401)

## Demo Credentials

Since backend uses API keys instead of passwords:

1. **Create Account**: Go to Signup
   - Username: `user_demo`
   - System generates API key automatically
   - Save the API key!

2. **Login**: Go to Login
   - Username: `user_demo`
   - API Key: (the one you saved)

For **Admin Access**: Manually modify MongoDB:
```javascript
// In MongoDB, update your user:
db.users.updateOne(
  { username: "user_demo" },
  { $set: { role: "admin" } }
)
```

## UI Highlights

- **Fintech Design**: Modern dark theme with gradient accents
- **Responsive Layout**: Works on desktop, tablet, mobile
- **Smooth Animations**: Fade-in, slide-up effects
- **Color-Coded Status**: 
  - Green = Success
  - Yellow = Rate Limited
  - Red = Blocked/Error
- **Real-time Data**: Refresh buttons for live metrics
- **Role-Based UI**: Different sidebars for User vs Admin



This UI + backend combination demonstrates:
1. ✅ Secure API Gateway implementation
2. ✅ JWT-based authentication
3. ✅ Rate limiting & blocking logic
4. ✅ Admin monitoring dashboard
5. ✅ Real-world fintech patterns
6. ✅ Professional UI/UX design
7. ✅ Full-stack integration



## Tech Stack

**Backend**
- Express.js
- MongoDB
- JWT (jsonwebtoken)

**Frontend**
- React 19
- Vite
- React Router DOM v7
- Axios
- Tailwind CSS v3
- Lucide React Icons

## Notes

- Mock data is provided for admin endpoints when backend isn't responding
- Rate limiting state resets on backend restart
- All timestamps are in ISO 8601 format
- CORS is enabled for localhost development

---


