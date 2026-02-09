# 🚀 START HERE - Risk-Based Security Implementation

## What Just Happened?

Two major security features have been added to your Vault Gate platform:

1. **Risk-Based Security Scoring** - Admin intelligence layer showing user risk (0-100)
2. **Account-Type Policies** - Different rate limits for SAVINGS vs CURRENT accounts

All implemented **without breaking changes**. Your existing code still works perfectly.

---

## Quick Start (5 minutes)

### 1. Start Backend
```bash
cd backend
npm start
```
✅ You should see: "Server running on http://localhost:5050"

### 2. Start Frontend  
```bash
cd frontend
npm run dev
```
✅ You should see: "Local: http://localhost:5174"

### 3. Test It
- Open http://localhost:5174/signup
- Create account: username `test1`, select **SAVINGS** account type
- Copy the API key
- Go to login, use credentials
- Go to /user/profile → See "Account Type: SAVINGS"
- Go to /admin/risk-analysis → See risk dashboard

**That's it!** Features are working.

---

## What's New?

### For Users
✨ **Account Type Selection** during signup
- SAVINGS (conservative): 10 req/min balance, 3 req/min transfer
- CURRENT (high-throughput): 20 req/min balance, 5 req/min transfer

✨ **Profile Enhancement**
- Shows your account type
- Shows policy mode (Conservative/High-Throughput)

### For Admins
✨ **New Risk Analysis Dashboard** at `/admin/risk-analysis`
- View all users' risk scores (0-100)
- See who's HIGH risk, MEDIUM risk, LOW risk
- Click on users to get detailed breakdown

✨ **Enhanced Suspicious Activity** 
- Now shows account type + risk score for each incident
- See exactly what factors contributed to risk

---

## File Changes Summary

### Backend Files (6 modified, 1 new)
```
src/utils/riskScoring.js          ← NEW: Risk calculation engine
src/models/User.js                ← Updated: +accountType field
src/models/ApiLog.js              ← Updated: +risk fields
src/controllers/auth.controller.js ← Updated: Handles accountType
src/middleware/rateLimit.middleware.js ← Updated: Dynamic limits + risk scoring
src/routes/admin.route.js         ← Updated: +2 new endpoints
```

### Frontend Files (7 modified, 1 new)
```
src/pages/admin/RiskSecurityEngine.jsx ← NEW: Admin risk dashboard
src/pages/Signup.jsx                   ← Updated: Account type selection
src/pages/Profile.jsx                  ← Updated: Shows account type
src/pages/admin/SuspiciousActivity.jsx ← Updated: Shows risk scores
src/components/AdminLayout.jsx         ← Updated: Risk Analysis link
src/utils/auth.js                      ← Updated: getAccountType() helper
src/App.jsx                            ← Updated: New route
```

### New Documentation (5 files)
```
EXECUTIVE_SUMMARY.md              ← This level - overview for everyone
RISK_SECURITY_FEATURES.md         ← Deep dive: How risk scoring works
INTEGRATION_GUIDE.md              ← Setup guide + testing instructions
VISUAL_ARCHITECTURE_GUIDE.md       ← Diagrams showing data flow
IMPLEMENTATION_SUMMARY.md         ← What was built & why
DEPLOYMENT_CHECKLIST.md          ← Step-by-step verification
```

---

## Key Concepts Explained

### Risk Score (0-100)
A **transparent number** showing how risky a user's behavior is.

**Why it increases:**
- Sending 20+ requests in 5 minutes (+30 for SAVINGS, +15 for CURRENT)
- Getting rate-limited 3+ times (+25 or +15)
- Accessing /transfer endpoint repeatedly (+20 or +10)
- Failed authentication attempts 3+ times (+40 or +30)

**What it means:**
- 0-30: LOW risk (allowed)
- 31-60: MEDIUM risk (monitored)
- 61-100: HIGH risk (user blocked for 15 min)

**Who sees it:**
- ✅ Admins (full visibility)
- ❌ Users (never shown, only feel the effects)

### Account Type Policy
**SAVINGS** = Conservative (strict limits)
**CURRENT** = High-throughput (generous limits)

Applied automatically. Users choose at signup. Admins can only observe.

---

## How It Works (30-second version)

```
User Makes API Request
          ↓
Extract accountType from JWT (e.g., "SAVINGS")
          ↓
Check rate limit: 10 req/min for SAVINGS, 20 for CURRENT
          ↓
Over limit? → Calculate risk score (analyzes last 20 requests)
          ↓
Store risk score + account type in MongoDB log
          ↓
HIGH risk? → Block user for 15 minutes (403)
Otherwise → Allow request (200)
          ↓
Admin sees risk on dashboard with explanation
```

**Result:** Transparent, explainable security with financial context.

---

## Testing Checklist (10 minutes)

- [ ] **Signup test:** Create account, select SAVINGS, copy API key
- [ ] **Login test:** Login with username + API key, see account type in profile
- [ ] **Rate limit test:** Hit `/api/spam-requests`, see requests succeed up to limit
- [ ] **Block test:** Make 15+ rapid requests, get 429 then 403
- [ ] **Admin test:** Login as admin, go to `/admin/risk-analysis`
- [ ] **Risk display:** See risk scores in admin dashboard
- [ ] **Investigation:** Click "Investigate" on suspicious activity

All tests should pass without errors.

---

## Documentation Map

Read these in order:

1. **This file** (5 min) - Overview
2. **EXECUTIVE_SUMMARY.md** (10 min) - Full picture
3. **RISK_SECURITY_FEATURES.md** (30 min) - How risk scoring works
4. **INTEGRATION_GUIDE.md** (15 min) - Setup + testing
5. **DEPLOYMENT_CHECKLIST.md** (30 min) - Verification before going live

For visuals: **VISUAL_ARCHITECTURE_GUIDE.md**

---

## Common Questions

**Q: Will this break my existing code?**
A: No. All changes are backward compatible. Existing users default to SAVINGS account type.

**Q: Do users see their risk score?**
A: No. Only admins see scores. Users only experience effects (throttling, blocks).

**Q: Can I change the rate limits?**
A: Yes! Edit `src/utils/riskScoring.js` RATE_THRESHOLDS object. Deploy backend.

**Q: How often is the risk dashboard updated?**
A: Every 10 seconds (auto-refresh). Risk calculated on every request.

**Q: What if a user gets blocked?**
A: 15-minute automatic block. After expiry, requests work again.

---

## For Hackathon Demo

**Show judges this flow:**

1. **Signup** with account type selection
   - "Hey, different accounts get different limits for security"

2. **Profile page** shows selected type
   - "Users know their policy mode (Conservative/High-Throughput)"

3. **Rate limiting** with different thresholds
   - "SAVINGS = 10 req/min, CURRENT = 20 req/min"

4. **Admin risk dashboard**
   - "Watch real-time risk scores based on user behavior"

5. **Explain the logic**
   - "Risk increases with high request rate, violations, sensitive endpoints"
   - "Not ML - pure transparent rule-based logic"
   - "Financial domain aware - account type matters"

6. **Show investigation**
   - "Admins can see exactly why a user is risky"
   - "Can send alerts from the modal"

**Judge's takeaway:** "This demonstrates smart, explainable security with financial context awareness."

---

## Quick Reference

### New Endpoints (Admin Only)

**GET /api/admin/risk-dashboard**
- Lists all users with risk scores
- Summary statistics
- Auto-refreshes every 10 seconds

**GET /api/admin/risk-analysis/:userId**
- Detailed risk breakdown for one user
- Contributing factors
- Recent activity summary

### Enhanced Endpoints

**POST /auth/register**
- Now accepts: `accountType: "SAVINGS"` or `"CURRENT"`
- Returns: `accountType` in response

**POST /auth/login**  
- Returns: JWT now includes `accountType`

**GET /api/admin/suspicious-activity**
- Now includes: `accountType`, `riskScore`, `riskLevel`, `riskFactors`

---

## Troubleshooting

**Backend won't start?**
```bash
# Check syntax
node -c src/utils/riskScoring.js

# Check MongoDB connection in .env
# Verify JWT_SECRET is set
```

**Frontend won't compile?**
```bash
# Clear cache
rm -rf node_modules
npm install
npm run dev
```

**No risk scores showing?**
- Make some API requests first
- Risk calculated per request
- Check MongoDB has ApiLog entries
- Wait 10 seconds for dashboard refresh

**Account type not showing?**
- Backend: Check login returns `accountType`
- Frontend: Check browser localStorage has token
- Verify `getAccountType()` function works

---

## Next Steps

### Immediate (Now)
1. ✅ Read this file
2. ✅ Run backend + frontend
3. ✅ Test basic flow
4. ✅ Try admin dashboard

### Short-term (Before Demo)
1. ✅ Test all 10 checklist items
2. ✅ Adjust rate limits if needed (edit riskScoring.js)
3. ✅ Practice your explanation for judges
4. ✅ Screenshot the risk dashboard

### Before Production
1. ✅ Follow DEPLOYMENT_CHECKLIST.md
2. ✅ Backup MongoDB
3. ✅ Monitor logs first 24h
4. ✅ Have rollback plan ready

---

## Need Help?

**Feature questions:** RISK_SECURITY_FEATURES.md
**Setup questions:** INTEGRATION_GUIDE.md
**Architecture questions:** VISUAL_ARCHITECTURE_GUIDE.md
**What changed:** IMPLEMENTATION_SUMMARY.md
**Deployment:** DEPLOYMENT_CHECKLIST.md

---

## You're All Set! 🎉

Your Vault Gate platform now has:
- ✅ Risk-based security intelligence
- ✅ Account-type aware policies  
- ✅ Admin monitoring dashboard
- ✅ Real-time user investigation
- ✅ Fully documented & tested

**Time to impress the judges!**

---

**Last Updated:** February 2, 2026
**Status:** ✅ Ready for hackathon
**Questions?** Check the documentation files above

