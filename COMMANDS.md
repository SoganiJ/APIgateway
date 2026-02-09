# ⚡ QUICK COMMANDS

## Start Everything in 60 Seconds

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Expected:
```
Server running on port 5000
MongoDB connected
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Expected:
```
  VITE v7.2.4  ready in 500ms
  
  ➜  Local:   http://localhost:5173/
```

### Open Browser
```
http://localhost:5173
```

---

## Useful Commands

### Frontend Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Backend Commands
```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

---

## First Time Setup

If you haven't installed dependencies yet:

```bash
# Frontend
cd frontend
npm install

# Backend (if needed)
cd ../backend
npm install
```

---

## API Endpoints Reference

### Authentication
```
POST /auth/register
POST /auth/login
```

### User APIs
```
GET  /api/balance
POST /api/payment
GET  /api/test-endpoint
GET  /api/user/activity
```

### Admin APIs
```
GET /api/admin/metrics
GET /api/admin/traffic
GET /api/admin/suspicious-activity
```

---

## Test Credentials

### Create New Account
1. Go to http://localhost:5173/signup
2. Enter username: `test_user_123`
3. Click "Create Account"
4. **Save the API key!**
5. Click "Go to Login"
6. Login with username + saved API key

### Switch to Admin
```bash
# If you have MongoDB installed locally:
mongosh  # or mongo if using older version

# Then run:
use vault_gate
db.users.updateOne(
  { username: "test_user_123" },
  { $set: { role: "admin" } }
)
```

Then logout and login again - you'll be in admin dashboard!

---

## File Locations

### Key Frontend Files
- `frontend/src/App.jsx` - Main routing
- `frontend/src/pages/` - All pages
- `frontend/src/components/` - Layouts and guards
- `frontend/src/utils/axios.js` - API client
- `frontend/.env` - API URL config

### Key Backend Files
- `backend/src/app.js` - Express setup
- `backend/src/routes/api.route.js` - User APIs
- `backend/src/routes/admin.route.js` - Admin APIs
- `backend/src/middleware/auth.middleware.js` - JWT validation

---

## Troubleshooting

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port already in use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Clear browser cache
- Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
- Clear cache and cookies
- Reload page

### Clear localStorage
```javascript
// In browser console (F12):
localStorage.clear()
location.reload()
```

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vault_gate
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

---

## Performance Tips

### For Faster Dev Experience
```bash
# Clear cache before building
npm cache clean --force

# Use faster build tool
npm run build  # Already using Vite (fast!)
```

### Network Issues
```bash
# If APIs not responding:
1. Check backend is running (npm run dev in backend/)
2. Check port 5000 is accessible
3. Check .env VITE_API_URL is correct
4. Check CORS is enabled (it is in app.js)
```

---

## Keyboard Shortcuts

### In Frontend (Browser)
- `F12` - Open Developer Tools
- `Ctrl+Shift+Delete` - Clear Cache
- `Ctrl+K` - Focus on address bar
- `Ctrl+L` - Focus on address bar and select all

### In Terminal
- `Ctrl+C` - Stop server
- `Ctrl+Z` - Suspend server (type `fg` to resume)
- `Up Arrow` - Previous command
- `Clear` - Clear terminal

---

## Monitoring Tools

### Check Backend Logs
```bash
# Terminal showing "npm run dev" output
# Shows all API requests and errors
```

### Check Frontend Logs
```bash
# Browser Console (F12)
# Shows network requests and errors
```

### Monitor Network Requests
```
F12 → Network Tab → Reload Page
```

Shows all API calls with:
- Method (GET, POST, etc.)
- Status code
- Response time
- Response data

---

## Database (Optional)

If using MongoDB locally:

### Install MongoDB
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community

# Linux
sudo apt-get install mongodb
```

### Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Access Database
```bash
mongosh
# or older version:
mongo
```

---

## Docker (Optional)

Run everything in containers:

```dockerfile
# backend/Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]
```

```bash
# Build and run
docker build -t vault-gate-backend ./backend
docker run -p 5000:5000 vault-gate-backend
```

---

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Creates dist/ folder with optimized build
```

### Deploy to Vercel (Frontend)
```bash
npm i -g vercel
vercel
# Follow prompts
```

### Deploy to Heroku (Backend)
```bash
heroku create vault-gate-api
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

---

## Helpful Extensions

### VS Code Extensions (Optional)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- Thunder Client (API testing)

### Browser Extensions
- React Developer Tools
- Redux DevTools
- Postman (API testing)

---

## Stay Updated

Check files for latest updates:
- `QUICKSTART.md` - Setup guide
- `README.md` - Features & API docs
- `COMPLETION_SUMMARY.md` - Project overview
- `TESTING.md` - Test cases

---

## Need Help?

1. **Check QUICKSTART.md** - Most common issues
2. **Check README.md** - Feature documentation
3. **Check TESTING.md** - Expected behavior
4. **Check browser console (F12)** - JavaScript errors
5. **Check terminal output** - Backend errors
6. **Check Network tab (F12)** - API request/response

---

## One Last Thing

**BEFORE HACKATHON:**

```bash
# Make sure everything works:
1. cd backend && npm run dev      # Backend running?
2. cd frontend && npm run dev     # Frontend running?
3. http://localhost:5173          # Can you login?
4. Try spam requests              # Does rate limiting work?
5. Switch to admin                # Can you see admin dashboard?
```

If all 5 ✅, you're ready to present! 

---

**Good luck! 🚀**
