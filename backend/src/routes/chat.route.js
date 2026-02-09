const express = require('express');
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Platform Knowledge Base for Chatbot
 */
const PLATFORM_KNOWLEDGE = `
You are a helpful assistant for Vault Gate, a secure banking and API gateway security platform. 

Platform Overview:
- Vault Gate is a comprehensive API Gateway with advanced security features
- It protects financial transactions and manages user accounts
- Features include rate limiting, anomaly detection, risk scoring, and policy simulation

Key Features:
1. API Gateway: Manages incoming API requests with security checks
2. Rate Limiting: Prevents abuse by limiting requests per user/IP
3. Risk Scoring: Analyzes requests on a scale of 0-100 for security threats
4. Anomaly Detection: Identifies suspicious activity and blocks malicious requests
5. Policy Simulation: Allows admins to test security policies before deployment
6. Real-time Notifications: Alerts users and admins of security events
7. Admin Dashboard: Monitors metrics, traffic, suspicious activity, and system health
8. User Dashboard: Shows account balance, transaction history, and security alerts

How Rate Limiting Works:
- Gateway tracks requests per user and IP address
- Limits: 100 requests per minute per user, 500 per IP
- Exceeding limits results in 429 Too Many Requests response
- Rate limits reset every minute

Risk Scoring System (0-100):
- 0-20: Low Risk (Green) - Normal traffic
- 21-50: Medium Risk (Yellow) - Unusual patterns, requires monitoring
- 51-80: High Risk (Orange) - Suspicious activity, may be blocked
- 81-100: Critical Risk (Red) - Malicious activity, immediate blocking

Suspicious Activity Detection:
- Multiple failed login attempts (>3 in 5 minutes)
- Requests from unusual locations
- High error rates (400, 500, 502 errors)
- Rate limit violations (429 errors)
- Unusual request patterns or data extraction attempts

User Features:
- Check account balance anytime
- View transaction history
- Make payments through the secure API
- Monitor security notifications
- Review activity logs
- Enable two-factor authentication

Admin Features:
- View real-time security metrics
- Monitor API traffic patterns
- Investigate suspicious activities
- Send security notifications to users
- Analyze risk trends and patterns
- Test policies before deployment
- Configure system settings and alerts

Common Issues & Solutions:
Q: Why was my request blocked?
A: Your request matched suspicious activity patterns (e.g., multiple 400 errors, rate limit excess, unusual location)

Q: How to increase rate limits?
A: Contact support. Limits are set per account based on security assessment.

Q: How does authentication work?
A: Users login with email/password. JWT tokens valid for 24 hours. Refresh tokens available.

Q: Can I test policies?
A: Yes, use Policy Simulation on admin dashboard to test rules without affecting live traffic.

Q: What triggers notifications?
A: Admin notifications sent for: rate limit violations, authentication failures, unusual request patterns, high error rates.

Security Best Practices:
- Use strong passwords (16+ characters, mixed case, numbers, symbols)
- Enable notifications to stay informed of security events
- Review activity logs regularly
- Avoid sharing API keys
- Use VPN for sensitive transactions
- Monitor your account for unusual activity

API Integration:
- All requests use HTTPS
- Authentication: Bearer token in Authorization header
- Rate limits: 100 requests/minute per user
- Response format: JSON
- Error codes: 400 (bad request), 401 (unauthorized), 429 (rate limited), 500 (server error)

Please answer questions helpfully about these topics. If asked about something outside the platform scope, politely redirect to platform-related topics.
`;

/**
 * POST /api/chat
 * Chat with Groq-powered assistant for Vault Gate platform
 */
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'Groq API key not configured' });
        }

        // Construct messages for Groq API
        const messages = [
            {
                role: 'system',
                content: PLATFORM_KNOWLEDGE
            },
            {
                role: 'user',
                content: message
            }
        ];

        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant', // Currently supported free model on Groq
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Groq API Error:', error);
            return res.status(response.status).json({
                error: 'Failed to get response from AI',
                details: error.error?.message || 'Unknown error'
            });
        }

        const data = await response.json();
        const assistantMessage = data.choices[0]?.message?.content || 'No response generated';

        res.json({
            success: true,
            response: assistantMessage
        });

    } catch (error) {
        console.error('Chat route error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;
