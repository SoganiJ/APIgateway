# Chatbot Feature - Quick Start

## What Was Added

A fully functional AI chatbot using **Groq API** has been integrated into your Vault Gate platform.

### Features:
✅ Appears as a **blue circle button** at bottom-right of every dashboard  
✅ Opens a **popup chat window** when clicked  
✅ Uses **Groq AI** for intelligent responses  
✅ Has built-in knowledge about the Vault Gate platform  
✅ Works on **both Admin and User dashboards**  
✅ Responsive and mobile-friendly design  
✅ Real-time message history  

## Quick Setup (5 Minutes)

### Step 1: Get Your API Key
1. Visit https://console.groq.com
2. Sign up (free)
3. Go to API Keys section
4. Copy your API key

### Step 2: Configure Backend
Open `backend/.env` and add:
```
GROQ_API_KEY=paste_your_key_here
```

### Step 3: Restart Server
```bash
cd backend
npm start
```

## Done! 🎉

The chatbot is now ready to use. You'll see a blue circle button at the bottom-right of:
- Admin Dashboard
- User Dashboard

## Testing

1. Navigate to Admin or User Dashboard
2. Look for the **blue circle** button in the bottom-right corner
3. Click it to open the chat
4. Try asking:
   - "How does rate limiting work?"
   - "What is risk scoring?"
   - "How do notifications work?"
   - "What security features does the platform have?"

## Files Created/Modified

### New Files:
- `backend/src/routes/chat.route.js` - Chatbot API endpoint
- `frontend/src/components/Chatbot.jsx` - Chatbot UI component
- `CHATBOT_SETUP.md` - Detailed setup guide

### Modified Files:
- `backend/src/app.js` - Added chat route
- `backend/.env` - Added GROQ_API_KEY
- `frontend/.env` - Added VITE_GROQ_API_URL
- `frontend/src/pages/admin/AdminDashboard.jsx` - Added Chatbot component
- `frontend/src/pages/user/UserDashboard.jsx` - Added Chatbot component

## Support

For troubleshooting, see the detailed guide: [CHATBOT_SETUP.md](./CHATBOT_SETUP.md)

### Common Issues:

**Q: Chatbot doesn't appear?**  
A: Make sure backend is running and API key is set in .env

**Q: Says "API key not configured"?**  
A: Check that GROQ_API_KEY is in backend/.env and restart the server

**Q: Responses are slow?**  
A: Normal on free tier (2-5 seconds). Upgrade for faster responses.

---

**All done!** Your chatbot is now live and ready to help users. 🚀
