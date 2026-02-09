# Deployment & Verification Checklist

## Pre-Deployment (Backend)

### Code Quality
- [ ] `node -c src/models/User.js` - No syntax errors
- [ ] `node -c src/models/ApiLog.js` - No syntax errors
- [ ] `node -c src/controllers/auth.controller.js` - No syntax errors
- [ ] `node -c src/middleware/rateLimit.middleware.js` - No syntax errors
- [ ] `node -c src/utils/riskScoring.js` - No syntax errors
- [ ] `node -c src/routes/admin.route.js` - No syntax errors

### Dependencies
- [ ] All imports in riskScoring.js are available
- [ ] MongoDB connection string in .env is correct
- [ ] JWT_SECRET is configured in .env
- [ ] No missing npm packages

### Database
- [ ] MongoDB Atlas connection is active
- [ ] Collections created: users, apilogs, notifications
- [ ] Existing users have accountType field (auto-migrated to SAVINGS)

---

## Pre-Deployment (Frontend)

### Code Quality
- [ ] `npm run build` completes without errors
- [ ] No missing imports in new/modified files
- [ ] No broken links to components

### Key Files Verified
- [ ] `src/pages/Signup.jsx` - Has account type selection
- [ ] `src/pages/Profile.jsx` - Shows account type
- [ ] `src/pages/admin/RiskSecurityEngine.jsx` - Renders correctly
- [ ] `src/components/AdminLayout.jsx` - Risk Analysis link added
- [ ] `src/utils/auth.js` - Has getAccountType() function
- [ ] `src/App.jsx` - Has /admin/risk-analysis route

### Environment
- [ ] `.env` has VITE_API_URL=http://localhost:5050
- [ ] No console errors when building

---

## Deployment Sequence

### Step 1: Start Backend
```bash
cd backend
npm start
```
**Expected:**
- ✅ Server running on http://localhost:5050
- ✅ MongoDB connected
- ✅ No error logs

**Verify:**
```bash
curl http://localhost:5050/health  # Should return 200 if health route exists
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```
**Expected:**
- ✅ Dev server running on http://localhost:5174
- ✅ No Vite errors
- ✅ HMR enabled

**Verify:**
```bash
# Open http://localhost:5174 in browser
# Should see landing page without errors
```

### Step 3: Verify API Connectivity
1. Open http://localhost:5174
2. Go to /signup
3. Create account with SAVINGS type
4. Go to /login
5. Login with credentials
6. Should see dashboard with account type in profile

---

## Feature Testing Sequence

### Test 1: Account Type Selection

**Step 1:** Signup flow
```
1. Navigate to http://localhost:5174/signup
2. Enter username: test_savings
3. Select "Savings Account" radio button
4. Click "Create Account"
5. Copy API key
6. Expected: Success message shows account type
```

**Verification:**
- [ ] Account type selection visible
- [ ] SAVINGS option selected by default
- [ ] Success page shows "Account Type: SAVINGS"

**Step 2:** Profile display
```
1. Go to /login
2. Enter credentials
3. Click "Go to Dashboard"
4. Go to /user/profile
5. Expected: "Account Type: SAVINGS" displayed
6. Expected: "Policy Mode: Conservative" shown
```

**Verification:**
- [ ] Account Type card displays
- [ ] Shows correct value (SAVINGS)
- [ ] Policy Mode shows "Conservative"

---

### Test 2: Rate Limiting (SAVINGS Account)

**Setup:** Logged in as test_savings user

**Test:**
```
1. Go to /user/spam-requests
2. Click "Send 15 Rapid Requests"
3. Monitor requests:
   - Request 1-10: ✓ 200 OK (under 10/min limit)
   - Request 11: ✗ 429 Rate Limited
   - Request 12: ✗ 429 Rate Limited
   - Request 13-15: ✗ 403 Forbidden (user blocked)
4. Wait 15 minutes
5. Try again: ✓ 200 OK (block expired)
```

**Verification:**
- [ ] Requests 1-10 succeed
- [ ] Request 11+ shows 429 status
- [ ] After violations: 403 Forbidden
- [ ] Block persists for ~15 minutes
- [ ] After block expires: requests work again

---

### Test 3: Rate Limiting (CURRENT Account)

**Setup:** New signup with CURRENT account type

**Test:**
```
1. Signup as test_current
2. Select "Current Account" type
3. Login
4. Go to /user/spam-requests
5. Click "Send 25 Rapid Requests"
6. Monitor:
   - Request 1-20: ✓ 200 OK (under 20/min limit)
   - Request 21: ✗ 429 Rate Limited (over limit)
   - More violations: Possible 403 block
```

**Verification:**
- [ ] Requests 1-20 succeed (not 10)
- [ ] Higher tolerance than SAVINGS
- [ ] Rate-limited after 20 (not 10)

---

### Test 4: Admin Risk Dashboard

**Setup:** Logged in as admin account

**Test:**
```
1. Navigate to /admin/risk-analysis
2. Page should load with:
   - Summary cards (Total Users, High Risk, etc.)
   - Risk table with user list
   - Each user showing: Name, Account Type, Risk Score, Level
3. Wait 10 seconds
4. Data should auto-refresh
5. Risk scores should reflect recent activity
```

**Verification:**
- [ ] Risk Analysis page loads
- [ ] Summary statistics display
- [ ] Risk table renders correctly
- [ ] Auto-refresh working (every 10 sec)
- [ ] Risk scores show for users with activity

---

### Test 5: Suspicious Activity with Risk Data

**Setup:** Admin account, after rate-limiting tests above

**Test:**
```
1. Go to /admin/suspicious-activity
2. See activities from rate-limited users
3. Each activity should show:
   - Username + Account Type badge
   - Risk Score (e.g., "68 (HIGH)")
   - Risk Level indicator
   - Top risk factors listed
4. Click "Investigate" on any activity
5. Modal shows user info + alert form
```

**Verification:**
- [ ] Activity list displays
- [ ] Account Type badges visible
- [ ] Risk scores displayed
- [ ] Risk level indicators (color-coded)
- [ ] Risk factors listed
- [ ] Investigate modal works

---

### Test 6: User Profile Shows Account Type

**Setup:** Logged in as regular user

**Test:**
```
1. Go to /user/profile
2. Should see "Account Type" card with:
   - Account Type: SAVINGS (or CURRENT)
   - Policy Mode: Conservative (or High-Throughput)
   - Explanation text about the policy
3. Account type should be read-only (no edit option)
```

**Verification:**
- [ ] Account Type card renders
- [ ] Shows correct account type
- [ ] Policy Mode matches type
- [ ] Read-only (no change button)

---

### Test 7: Signup Account Type Selection

**Setup:** Going through signup flow

**Test:**
```
1. Go to /signup
2. Form should show:
   - Username input
   - Account Type section with TWO options:
     a) "Savings Account" (Conservative) - SELECTED BY DEFAULT
     b) "Current Account" (High-Throughput)
3. Select "Current Account"
4. Create account
5. Success page should show: "Account Type: CURRENT"
```

**Verification:**
- [ ] Account Type section visible
- [ ] Two radio options displayed
- [ ] SAVINGS is default selection
- [ ] Can switch to CURRENT
- [ ] Success confirms chosen type

---

### Test 8: Risk Score Calculation

**Setup:** Admin account, after making requests as user

**Test:**
```
1. Trigger multiple rate limit violations:
   - Make 15 rapid requests to /api/balance
   - Get 429 rate-limited response
2. Check /admin/risk-dashboard
3. Look for the user who made requests
4. Verify risk score increased:
   - Should show score > 30 (factors detected)
   - Risk level should be MEDIUM or HIGH
   - Risk factors should list: "High request rate", "Repeated violations"
```

**Verification:**
- [ ] Risk score calculated
- [ ] Risk level assigned (not LOW if violations exist)
- [ ] Risk factors listed
- [ ] Scores update as behavior changes

---

### Test 9: Admin Alert Notifications

**Setup:** Admin + regular user accounts

**Test:**
```
1. As admin: Go to /admin/suspicious-activity
2. Click "Investigate" on a suspicious user
3. Modal opens showing user info
4. Type alert message: "Your account exceeded rate limits"
5. Click "Send Alert"
6. Response should confirm: "Notification sent"
7. As user: Go to /user/notifications
8. Should see new alert from admin
   - Shows message
   - Shows severity (HIGH/MEDIUM/LOW)
   - Has "Mark as Read" option
```

**Verification:**
- [ ] Investigate modal opens
- [ ] Alert form submits successfully
- [ ] User receives notification
- [ ] Notification displays correctly
- [ ] Can mark as read

---

## Database Verification

### MongoDB Collections Check

**Users Collection:**
```javascript
db.users.findOne()
// Should show:
// {
//   _id: ObjectId(...),
//   username: "test_savings",
//   apiKey: "...",
//   role: "user",
//   accountType: "SAVINGS",  ◄─ Verify this field
//   createdAt: Date,
//   updatedAt: Date
// }
```

**ApiLog Collection:**
```javascript
db.apilogs.findOne()
// Should show:
// {
//   _id: ObjectId(...),
//   userId: ObjectId(...),
//   endpoint: "/api/balance",
//   method: "GET",
//   statusCode: 200,
//   accountType: "SAVINGS",  ◄─ New field
//   riskScore: 25,           ◄─ New field
//   riskLevel: "LOW",        ◄─ New field
//   riskFactors: [...],      ◄─ New field
//   createdAt: Date
// }
```

**Queries to run:**
```javascript
// Count users with accountType field
db.users.countDocuments({ accountType: { $exists: true } })
// Should return: same as total user count

// Count logs with risk data
db.apilogs.countDocuments({ riskScore: { $exists: true } })
// Should return: > 0 (after making requests)

// Find high-risk users
db.apilogs.find({ riskLevel: "HIGH" })
// Should return: results after rate-limiting tests
```

---

## Performance Testing

### Response Times

**Login endpoint:**
```bash
time curl -X POST http://localhost:5050/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","apiKey":"..."}'
```
Expected: < 500ms

**Risk dashboard endpoint:**
```bash
time curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5050/api/admin/risk-dashboard
```
Expected: < 2000ms (first load, then cached)

**Protected API endpoint:**
```bash
time curl -H "Authorization: Bearer TOKEN" \
  -H "x-api-key: ..." \
  http://localhost:5050/api/balance
```
Expected: < 200ms (with risk calculation)

---

## Browser Console Checks

### Frontend Console (DevTools → Console)

**No errors expected for:**
- ✅ No "Unhandled promise rejection"
- ✅ No "Cannot find module" errors
- ✅ No "Undefined variable" warnings
- ✅ No import path errors

### Network Tab Checks

**After signup and login:**
- ✅ `/auth/register` → 201 Created
- ✅ `/auth/login` → 200 OK + JWT token
- ✅ Protected requests have Authorization header
- ✅ Protected requests have x-api-key header

**Admin endpoints:**
- ✅ `/api/admin/risk-dashboard` → 200 OK
- ✅ `/api/admin/risk-analysis/:userId` → 200 OK
- ✅ `/api/admin/suspicious-activity` → 200 OK (with risk data)

---

## Rollback Plan (If Needed)

### If Backend Fails to Start
```bash
# Check for syntax errors
node -c src/utils/riskScoring.js

# Check MongoDB connection
# Verify .env has correct URI

# Revert to previous version if needed
git checkout HEAD -- src/
```

### If Frontend Won't Compile
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf .vite

# Rebuild
npm run build
```

### If Rate Limiting Breaks
- Check rateLimit.middleware.js syntax
- Verify accountType extraction from JWT
- Test with curl instead of browser (skip JWT complexity)

### If Risk Calculation Fails
- Check MongoDB is running
- Verify ApiLog collection exists
- Check riskScoring.js imports

---

## Success Criteria

✅ **System is production-ready when:**

1. **Backend Requirements**
   - [ ] All endpoints return correct status codes
   - [ ] MongoDB logging working (riskScore, accountType fields present)
   - [ ] Rate limits enforced per account type
   - [ ] Risk scores calculated for all requests
   - [ ] Admin endpoints return proper JSON

2. **Frontend Requirements**
   - [ ] All pages load without JavaScript errors
   - [ ] Signup shows account type selection
   - [ ] Profile displays account type
   - [ ] Risk Analysis dashboard shows user data
   - [ ] Suspicious Activity shows risk context

3. **Integration Requirements**
   - [ ] User can signup with account type
   - [ ] User can login and see account type
   - [ ] Rate limiting works per account type
   - [ ] Admin can view risk analysis
   - [ ] Admin can investigate users

4. **Data Requirements**
   - [ ] Users have accountType field
   - [ ] ApiLog records have riskScore fields
   - [ ] JWT includes accountType
   - [ ] No data loss or corruption

---

## Post-Deployment

### Monitoring Points

**Real-time Monitoring:**
- [ ] Backend logs showing risk calculations
- [ ] Frontend console clean (no errors)
- [ ] MongoDB growing with new ApiLog entries
- [ ] Admin dashboard shows current data

**Metrics to Watch:**
- [ ] Average risk score per user
- [ ] Rate limit violations per endpoint
- [ ] HIGH risk user count
- [ ] 15-minute block frequency

### Maintenance Tasks

**Daily:**
- [ ] Check error logs
- [ ] Monitor active users
- [ ] Verify admin dashboard functionality

**Weekly:**
- [ ] Review high-risk users
- [ ] Analyze rate-limiting patterns
- [ ] Check database disk usage

**As Needed:**
- [ ] Adjust risk weights (src/utils/riskScoring.js)
- [ ] Modify rate limit thresholds
- [ ] Investigate anomalies in admin dashboard

---

## Support Documentation

**For Users:**
- QUICKSTART.md - Setup guide
- README.md - Feature overview

**For Admins:**
- RISK_SECURITY_FEATURES.md - Complete risk system documentation
- VISUAL_ARCHITECTURE_GUIDE.md - How system works visually

**For Developers:**
- IMPLEMENTATION_SUMMARY.md - What was changed
- INTEGRATION_GUIDE.md - How to deploy

---

## Sign-Off

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

**Notes:** _______________

---

**All tests passed? You're ready for production!** ✅

