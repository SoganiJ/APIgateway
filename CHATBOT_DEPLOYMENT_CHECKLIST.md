# Chatbot Deployment Checklist

## Pre-Deployment Configuration

### Environment Setup
- [ ] **Backend API Key**: Add your Groq API key to `backend/.env`
  ```
  GROQ_API_KEY=your_actual_key_here
  ```
- [ ] **Verify Paths**: Check all file paths are correct:
  - [ ] `backend/src/routes/chat.route.js` exists
  - [ ] `frontend/src/components/Chatbot.jsx` exists
  - [ ] Both `.env` files have been updated

### Backend Configuration
- [ ] Chat route imported in `backend/src/app.js`
- [ ] Chat route mounted at `/api/chat`
- [ ] Groq API key is set in environment
- [ ] No typos in route path

### Frontend Configuration
- [ ] Chatbot component imported in AdminDashboard
- [ ] Chatbot component imported in UserDashboard
- [ ] Component is rendered inside dashboard divs
- [ ] Environment variable `VITE_GROQ_API_URL` is set

## Server Startup

### Backend
```bash
# Terminal 1: Backend
cd backend
npm start
```

Expected output:
```
Server running on port 5050
Connected to MongoDB
```

Verify chat route:
```bash
curl -X POST http://localhost:5050/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

Should return:
```json
{
  "success": true,
  "response": "AI response text..."
}
```

### Frontend
```bash
# Terminal 2: Frontend (if not already running)
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x
App is running at http://localhost:5173
```

## Browser Testing

### Visual Verification
- [ ] Navigate to http://localhost:5173 (or your frontend URL)
- [ ] Login with any account (admin or user)
- [ ] Look for **blue circle button** at **bottom-right corner**
- [ ] Circle should have **MessageCircle icon** (💬)
- [ ] Circle has **gradient color** (blue to purple)

### Interaction Testing
- [ ] **Click circle** → Chat window opens smoothly
- [ ] Chat window shows title: "Vault Gate Assistant"
- [ ] Green dot animates next to title
- [ ] Initial bot message appears: "Hello! 👋 I'm your Vault Gate assistant..."
- [ ] Input field at bottom shows placeholder: "Ask me anything..."
- [ ] Send button appears with arrow icon

### Functional Testing
```
Test Case 1: Simple Question
├─ Type: "How does the platform work?"
├─ Press: Send button or Enter key
├─ Expect: Loading spinner appears
├─ Wait: 2-5 seconds
├─ Verify: Bot response appears
└─ Check: Message formats correctly (user right, bot left)

Test Case 2: Platform Knowledge
├─ Type: "What is rate limiting?"
├─ Expect: Detailed response about rate limits
├─ Verify: Contains numbers (100, 500, 429)
└─ Check: Response is coherent and relevant

Test Case 3: Multiple Messages
├─ Send: "What is risk scoring?"
├─ Send: "What are the risk levels?"
├─ Send: "How is risk calculated?"
├─ Expect: Each message has proper response
├─ Verify: Message history shows all messages
└─ Check: Auto-scrolls to latest message

Test Case 4: UI Interactions
├─ Action: Click X (close button)
├─ Expect: Chat window closes smoothly
├─ Verify: Circle button is visible again
├─ Action: Click circle again
├─ Expect: Chat opens with same history
└─ Note: Refreshing page clears history
```

### Error Testing
```
Test Case 1: Missing API Key
├─ Unset: GROQ_API_KEY from backend/.env
├─ Restart: Backend server
├─ Send: Any message to chatbot
├─ Expect: Error message
└─ Verify: Message contains "not configured"

Test Case 2: Server Down
├─ Stop: Backend server
├─ Send: Message from chatbot
├─ Expect: Error message
└─ Verify: Graceful error handling

Test Case 3: Invalid Input
├─ Try: Click Send with empty message
├─ Expect: Nothing happens (input validation)
└─ Verify: No API call made
```

## Browser Compatibility

Test on multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Edge

Test on mobile:
- [ ] iOS Safari
- [ ] Android Chrome

## Performance Testing

### Load Testing
```javascript
// Open browser console and run:
console.time('Chat Response');
// Send message in chatbot
console.timeEnd('Chat Response');
```

Acceptable metrics:
- [ ] Chat component loads in <100ms
- [ ] API response in 2-5 seconds (Groq)
- [ ] UI renders messages in <50ms
- [ ] No console errors

### Memory Testing
- [ ] Open DevTools → Memory tab
- [ ] Open/close chat window 10 times
- [ ] Memory should not continuously increase
- [ ] No memory leaks detected

## Production Deployment

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] API key is secure (not in code)
- [ ] CORS is properly configured
- [ ] Rate limiting works (30 req/min on Groq free)
- [ ] Error messages are user-friendly
- [ ] Mobile responsiveness verified

### Environment Variables
```
# Production backend/.env
GROQ_API_KEY=production_key_here
PORT=5050
MONGODB_URI=production_db_uri
JWT_SECRET=production_secret

# Production frontend/.env
VITE_API_URL=https://your-domain.com
VITE_GROQ_API_URL=https://your-domain.com/api/chat
```

### Deployment Steps
1. [ ] Build frontend: `npm run build`
2. [ ] Deploy to production server
3. [ ] Verify all environment variables are set
4. [ ] Restart backend service
5. [ ] Test on production URL
6. [ ] Monitor logs for errors
7. [ ] Check Groq API usage

## Monitoring & Maintenance

### Daily Checks
- [ ] Chatbot responds to test questions
- [ ] No error logs related to chat
- [ ] Groq API quota not exceeded
- [ ] Response times are acceptable

### Weekly Checks
- [ ] Review Groq API usage/costs
- [ ] Check for any reported issues
- [ ] Monitor error frequency
- [ ] Verify uptime metrics

### Monthly Checks
- [ ] Review popular questions asked
- [ ] Update platform knowledge if needed
- [ ] Optimize response patterns
- [ ] Review analytics/usage patterns

## Troubleshooting Checklist

### Chatbot Not Visible
- [ ] Backend server is running on port 5050
- [ ] Frontend is running on correct port
- [ ] Component is imported in dashboard files
- [ ] CSS is being applied (check DevTools)
- [ ] No console errors

### Responses Not Working
- [ ] Groq API key is correct and active
- [ ] Backend .env file has the key
- [ ] Backend was restarted after adding key
- [ ] API endpoint returns 200 status
- [ ] Check network tab in DevTools

### Styling Issues
- [ ] Tailwind CSS is properly configured
- [ ] No conflicting CSS in page
- [ ] Check viewport width (responsive design)
- [ ] Clear browser cache
- [ ] Check DevTools computed styles

### Performance Issues
- [ ] Groq API response time (normal: 2-5s)
- [ ] Network latency (check Network tab)
- [ ] Large conversation history (clear and refresh)
- [ ] Browser resources (check Performance tab)
- [ ] Consider upgrading Groq plan if too slow

## Success Criteria

✅ **All of the following must be true:**
1. [ ] Chatbot circle button visible on both dashboards
2. [ ] Can open/close chat window smoothly
3. [ ] Messages send and receive responses
4. [ ] Bot provides helpful platform information
5. [ ] No console errors or warnings
6. [ ] Responsive on mobile devices
7. [ ] Graceful error handling
8. [ ] Performance is acceptable (2-5s response time)
9. [ ] Security best practices followed
10. [ ] Documentation is complete and clear

## Sign-Off

- [ ] Testing completed by: _____________
- [ ] Date: _____________
- [ ] Status: **READY FOR PRODUCTION** / **NEEDS FIXES**
- [ ] Issues found: (list any issues)
  - Issue 1: _____________
  - Issue 2: _____________

## Quick Reference Commands

```bash
# Check if backend is running
curl http://localhost:5050/health

# Test chat endpoint
curl -X POST http://localhost:5050/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# View backend logs (if running in terminal)
# Should show "Chat route error: ..." if there are issues

# Clear browser cache
# Chrome: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)

# Check console for errors
# F12 → Console tab → Look for red errors

# Monitor API calls
# F12 → Network tab → Filter by "fetch/xhr"
```

---

## Summary

**Chatbot deployment is straightforward:**

1. ✅ Add Groq API key to `backend/.env`
2. ✅ Restart backend server
3. ✅ Refresh frontend
4. ✅ Test by clicking circle button
5. ✅ Verify bot responds

**Expected time to full deployment: 5-10 minutes**

**Support**: See [CHATBOT_SETUP.md](./CHATBOT_SETUP.md) for detailed troubleshooting
