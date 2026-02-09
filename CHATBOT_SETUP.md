# Chatbot Setup Guide

## Overview
A chatbot assistant has been integrated into both Admin and User dashboards using Groq API. The chatbot appears as a circle button at the bottom-right corner of the dashboard and opens a chat interface when clicked.

## Setup Instructions

### 1. Get Groq API Key

1. Go to https://console.groq.com
2. Sign up or log in with your account
3. Navigate to "API Keys" section
4. Click "Create API Key"
5. Copy your API key

### 2. Configure Backend (.env)

Open `backend/.env` and update:

```env
GROQ_API_KEY=your_actual_groq_api_key_here
```

Replace `your_actual_groq_api_key_here` with your actual Groq API key.

### 3. Configure Frontend (.env)

The frontend .env is already configured with:

```env
VITE_GROQ_API_URL=http://localhost:5050/api/chat
```

This points to the backend chat endpoint.

### 4. Install Dependencies (if not already done)

The chatbot uses existing dependencies. No new packages needed.

### 5. Restart Backend Server

```bash
cd backend
npm start
```

The server will now have the `/api/chat` endpoint available.

### 6. Test the Chatbot

1. Login to the dashboard (admin or user)
2. You should see a blue circular button at the bottom-right corner
3. Click it to open the chatbot
4. Ask any question about the platform

## Features

### Chatbot Capabilities
- **Platform Knowledge**: Answers questions about Vault Gate features
- **Rate Limiting Help**: Explains how rate limiting works
- **Risk Scoring**: Information about security risk levels
- **API Integration**: Guidance on API usage
- **Security Best Practices**: Tips for secure usage
- **Troubleshooting**: Common issues and solutions

### UI Features
- Circle button at bottom-right (always visible when closed)
- Smooth open/close animation
- Real-time message streaming
- Loading indicator while waiting for response
- Responsive design for mobile and desktop
- Message history in current session
- Clean, modern dark theme matching dashboard

## Available Models

The chatbot uses the `mixtral-8x7b-32768` model:
- **Free tier available**: No credit card required for free tier
- **Fast responses**: Optimized for quick inference
- **Quality**: High-quality responses suitable for technical support
- **Context**: 8x7B mixture of experts model

## File Structure

```
backend/
├── src/
│   ├── app.js (updated - chat route added)
│   └── routes/
│       └── chat.route.js (new - chatbot endpoint)
│
frontend/
├── .env (updated - GROQ endpoint configured)
├── src/
│   ├── components/
│   │   └── Chatbot.jsx (new - chatbot UI)
│   └── pages/
│       ├── admin/
│       │   └── AdminDashboard.jsx (updated - chatbot added)
│       └── user/
│           └── UserDashboard.jsx (updated - chatbot added)
```

## Endpoint Details

**POST /api/chat**

Request:
```json
{
  "message": "How does rate limiting work?"
}
```

Response:
```json
{
  "success": true,
  "response": "Rate limiting prevents abuse by restricting the number of requests..."
}
```

## Troubleshooting

### Chatbot Not Responding

**Error**: "Failed to get response from AI"
- **Solution**: Verify GROQ_API_KEY is correct in backend/.env
- **Check**: Groq account is active and API key is valid
- **Test**: Restart backend server after setting API key

### API Key Invalid

**Error**: "Failed to get response from AI - Invalid authentication"
- **Solution**: Double-check API key from Groq console
- **Verify**: No extra spaces or characters in the key
- **Update**: Restart backend after updating .env

### Endpoint Not Found

**Error**: "GET /api/chat 404"
- **Solution**: Ensure backend server is running
- **Check**: Chat route is imported in app.js
- **Restart**: Kill and restart backend with `npm start`

### Slow Responses

**Cause**: Groq free tier has rate limits
- **Solution**: Responses typically take 2-5 seconds
- **Wait**: Allow requests to complete (loading indicator shows progress)
- **Note**: Premium tier offers faster responses

## API Rate Limits (Groq Free Tier)

- **Requests per minute**: 30
- **Requests per day**: Depends on usage patterns
- **Max tokens per request**: 500
- **Model**: mixtral-8x7b-32768

## Customization Options

### Change Model
Edit `backend/src/routes/chat.route.js`, line with:
```javascript
model: 'mixtral-8x7b-32768'
```

Available free models on Groq:
- `gemma-7b-it`
- `llama2-70b-chat`
- `mixtral-8x7b-32768`

### Modify System Prompt
The platform knowledge base is in `PLATFORM_KNOWLEDGE` variable in chat.route.js. Update it to change chatbot behavior.

### Adjust Response Length
Change `max_tokens` in the API request (currently 500):
```javascript
max_tokens: 500,  // Increase for longer responses
```

### Styling
Chatbot styles are in `frontend/src/components/Chatbot.jsx`. Modify Tailwind classes to change appearance.

## Environment Variables Summary

| Variable | File | Value |
|----------|------|-------|
| `GROQ_API_KEY` | `backend/.env` | Your Groq API key |
| `VITE_GROQ_API_URL` | `frontend/.env` | `http://localhost:5050/api/chat` |

## Next Steps

1. ✅ Get Groq API key from console.groq.com
2. ✅ Add key to backend/.env
3. ✅ Restart backend server
4. ✅ Test chatbot on dashboard
5. 📝 Customize platform knowledge if needed
6. 🚀 Deploy to production

---

**Note**: The chatbot is now fully integrated. No additional setup is required beyond configuring your Groq API key.
