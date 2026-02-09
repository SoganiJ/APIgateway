# Quick Start Guide

## 1. Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
```

## 2. Start Frontend Server (in new terminal)

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v7.2.4  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

## 3. Access the Application

Open browser and go to: `http://localhost:5173/`

## Testing Flow

### As a Regular User:

1. **Sign Up**
   - Click "Sign Up here"
   - Enter username (e.g., `john_user`)
   - Click "Create Account"
   - **IMPORTANT**: Save the generated API key!

2. **Login**
   - Enter username + API key from signup
   - Get redirected to User Dashboard

3. **Test Features**
   - Check Balance (make 1-2 calls)
   - Make Payment (test with different amounts)
   - Go to "Spam Requests" and click "Start Attack"
   - Watch rate limiting in action:
     - First ~10 requests: ✅ Success (200)
     - Next requests: ⚠️ Rate Limited (429)
     - Further attempts: ❌ Blocked (403)

4. **View Activity**
   - Go to "Activity History"
   - See all your API interactions logged

### As an Admin:

1. **Create User**
   - Sign up as normal user (e.g., `admin_user`)

2. **Make Admin**
   - Use MongoDB Client (Studio 3T, MongoDB Compass, or CLI)
   - Update user role:
   ```javascript
   db.users.updateOne(
     { username: "admin_user" },
     { $set: { role: "admin" } }
   )
   ```

3. **Login as Admin**
   - Use admin credentials
   - Get redirected to Admin Dashboard

4. **Monitor Traffic**
   - **Dashboard**: View overall metrics
   - **API Traffic**: See per-endpoint statistics
   - **Suspicious Activity**: Monitor rate limits and security events

## Common Issues & Solutions

### "Cannot GET /user/dashboard"
- Make sure you're logged in
- Check if token exists in localStorage
- Clear localStorage and login again

### "404 API Error"
- Backend might not be running
- Check backend console for errors
- Make sure .env variables are set

### "Rate limiting not working"
- Ensure backend route middleware is applied
- Check RATE_LIMIT_THRESHOLD value (currently 10 requests/minute)
- Clear blockStatus by restarting backend

### "Admin routes not accessible"
- Verify user role is "admin" in MongoDB
- Restart frontend after changing role
- Check JWT token contains role claim

## Debugging

**Frontend Logs**
```bash
# In browser console (F12)
# Check network tab for API calls
# Redux DevTools to inspect state
```

**Backend Logs**
```bash
# In backend terminal
console.log(req.user)  // See auth context
console.log(requestLogs)  // See all requests
console.log(blockStatus)  // See blocked users
```

## For Hackathon Demo

**Presentation Flow:**
1. Open frontend - show login page design
2. Sign up - show API key generation
3. Login - show User Dashboard with beautiful cards
4. Make a payment - show successful response
5. Go to "Spam Requests" - click "Start Attack"
   - Show requests succeeding (200)
   - Show rate limit (429)
   - Show blocking (403)
6. Switch to Admin account
7. Show admin dashboard metrics
8. Show API traffic per endpoint
9. Show suspicious activity log
10. Conclude: "Production-ready fintech API gateway with security"

**Key Points:**
- Rate limiting prevents DDoS
- Admin dashboard provides visibility
- JWT provides security
- Responsive UI works on any device

---

**Questions? Check README.md for full documentation**
