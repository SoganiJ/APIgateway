# Risk-Based Security Scoring & Account-Type Aware Policies

## Overview

Two complementary security features have been added to the Secure API Gateway:

1. **Risk-Based Security Scoring** - An explainable, rule-based intelligence layer for admins
2. **Account-Type Aware Security Policies** - Financial-domain sensitive request limits

These features work together without code duplication, using a shared configuration system.

---

## Feature 1: Risk-Based Security Scoring

### Purpose

Provides admins with explainable security intelligence about user behavior patterns. This is **not ML** - it's a rule-based scoring system that tracks behavioral signals.

### Risk Score Model

**Range:** 0-100

**Calculation:** Per-user, updated with each request based on behavioral signals

**Risk Levels:**
- **0-30: LOW** → Allow all requests
- **31-60: MEDIUM** → Throttle/Restrict access
- **61-100: HIGH** → Temporary block (15 minutes)

### Risk Factors (Configurable Weights)

The risk score increases based on:

1. **High Request Rate** (+30 SAVINGS, +15 CURRENT)
   - More than 20 requests in 5 minutes
   - Lower threshold for SAVINGS accounts (conservative)

2. **Repeated Rate-Limit Violations** (+25 SAVINGS, +15 CURRENT)
   - 3+ rate-limit hits detected
   - Indicates intentional abuse

3. **Sensitive Endpoint Access** (+20 SAVINGS, +10 CURRENT)
   - Multiple accesses to `/api/transfer` or `/api/payment`
   - Higher sensitivity for SAVINGS accounts

4. **Failed Authentication** (+40 SAVINGS, +30 CURRENT)
   - 3+ failed auth attempts
   - Indicates potential account compromise

### Admin Visibility

**Admin Dashboard Pages:**
- `/admin/dashboard` - Summary metrics
- `/admin/risk-analysis` - Detailed user risk scores
- `/admin/suspicious` - Security events with risk context

**Risk-Only Info Displayed to Admins:**
- Risk score (0-100)
- Risk level (LOW/MEDIUM/HIGH)
- Contributing factors with explanations
- Recommended actions
- Policy mode applied (Conservative/High-Throughput)

**User Visibility:**
- ❌ Never see numeric risk scores
- ✅ Only experience security effects (throttling, blocking)
- User-facing message: "Due to unusually high request activity, access is temporarily restricted."

---

## Feature 2: Account-Type Aware Security Policies

### Account Types

Each user selects during signup:

- **SAVINGS** - Conservative security mode
- **CURRENT** - High-throughput mode

### Security Policy Differences

#### SAVINGS Account (Conservative)
```
/api/balance:  10 requests/minute
/api/transfer: 3 requests/minute
```
- Lower request limits
- Higher sensitivity to traffic spikes
- Faster cooldown on violations
- Higher risk score increases
- Policy Mode: "Conservative"

#### CURRENT Account (High-Throughput)
```
/api/balance:  20 requests/minute
/api/transfer: 5 requests/minute
```
- Higher request limits
- More burst tolerance
- Slower escalation
- Lower risk score increases
- Policy Mode: "High-Throughput"

### Rate Limit Enforcement

**Thresholds:**
- First violation: 429 status (rate-limited warning)
- Repeated violations: User blocked for 15 minutes (403 status)

**Blocking Logic:**
- HIGH risk score → automatic 15-minute block
- Repeated violations (count > 2x threshold) → automatic 15-minute block

### Implementation

The system dynamically applies thresholds:

```javascript
// Backend automatically selects thresholds
const threshold = getRateLimitThreshold(accountType, endpoint);
// SAVINGS + /api/balance = 10
// CURRENT + /api/balance = 20
```

No user configuration needed - admins can only **observe**, not modify.

---

## Data Model Changes

### User Model
```javascript
{
  username: String,
  apiKey: String,
  role: "user" | "admin",
  accountType: "SAVINGS" | "CURRENT",  // NEW
  createdAt: Date,
  updatedAt: Date
}
```

### ApiLog Model (Enhanced)
```javascript
{
  userId: ObjectId,
  endpoint: String,
  method: String,
  statusCode: Number,
  ipAddress: String,
  isBlocked: Boolean,
  reason: String,
  
  // NEW FIELDS
  accountType: "SAVINGS" | "CURRENT",
  riskScore: Number (0-100),
  riskLevel: "LOW" | "MEDIUM" | "HIGH",
  riskFactors: [{
    factor: String,
    contribution: Number,
    details: String
  }]
}
```

### JWT Payload (Enhanced)
```javascript
{
  userId: ObjectId,
  role: "user" | "admin",
  accountType: "SAVINGS" | "CURRENT",  // NEW
  iat: Timestamp,
  exp: Timestamp
}
```

---

## API Endpoints

### New Admin Endpoints

#### GET /api/admin/risk-analysis/:userId
Returns detailed risk analysis for a specific user.

**Response:**
```json
{
  "user": {
    "_id": "...",
    "username": "john_doe",
    "accountType": "SAVINGS",
    "policyMode": "Conservative"
  },
  "riskAnalysis": {
    "score": 68,
    "level": "HIGH",
    "action": "Temporary block applied",
    "factors": [
      {
        "factor": "High request rate",
        "contribution": 30,
        "details": "24 requests in last 5 minutes"
      },
      {
        "factor": "Repeated rate-limit violations",
        "contribution": 25,
        "details": "3 rate limit hits detected"
      }
    ],
    "timestamp": "2026-02-02T..."
  },
  "explanation": "User: john_doe (SAVINGS Account)...",
  "recentActivity": {
    "totalRequests": 45,
    "blockedRequests": 8,
    "rateLimitedRequests": 6,
    "lastRequest": "2026-02-02T..."
  }
}
```

#### GET /api/admin/risk-dashboard
Returns risk summary for all users.

**Response:**
```json
{
  "summary": {
    "totalUsers": 12,
    "highRiskCount": 2,
    "mediumRiskCount": 4,
    "averageRiskScore": 34.5
  },
  "users": [
    {
      "userId": "...",
      "username": "john_doe",
      "accountType": "SAVINGS",
      "policyMode": "Conservative",
      "riskScore": 68,
      "riskLevel": "HIGH",
      "action": "Temporary block applied",
      "topRiskFactors": [
        {
          "factor": "High request rate",
          "contribution": 30,
          "details": "..."
        }
      ],
      "timestamp": "2026-02-02T..."
    }
  ]
}
```

### Enhanced Endpoints

#### GET /api/admin/suspicious-activity
Now includes `accountType`, `riskScore`, `riskLevel`, `riskFactors` in response.

#### POST /auth/register
Now accepts `accountType` parameter:

**Request:**
```json
{
  "username": "john_doe",
  "accountType": "SAVINGS"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "username": "john_doe",
  "apiKey": "...",
  "accountType": "SAVINGS"
}
```

#### POST /auth/login
JWT token now includes `accountType`:

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJ...",
  "accountType": "SAVINGS"
}
```

---

## Frontend Changes

### New Pages

#### `/admin/risk-analysis`
Risk-Based Security Engine dashboard:
- Summary statistics (total users, high/medium/low risk counts)
- Average risk score across all users
- Detailed table showing each user's:
  - Risk score (0-100)
  - Risk level badge
  - Account type + policy mode
  - Top contributing risk factors
  - Action taken

### Updated Pages

#### `/pages/Signup.jsx`
- Added account type radio buttons (SAVINGS/CURRENT)
- Display selected account type in success state
- Account type included in register request

#### `/pages/Profile.jsx`
- Shows "Account Type" card with SAVINGS/CURRENT label
- Shows "Policy Mode" (Conservative/High-Throughput)
- Read-only information (users cannot change)

#### `/pages/admin/SuspiciousActivity.jsx`
- Activity cards now show:
  - Account type badge
  - Risk score + level
  - Top 2 risk factors contributing to score
  - IP, timestamp as before

#### `/components/AdminLayout.jsx`
- Added "Risk Analysis" nav item (Shield icon)
- Routes to `/admin/risk-analysis`

### Helper Functions

#### `src/utils/auth.js`
```javascript
getAccountType() // Returns accountType from JWT
```

---

## Architecture & Design

### No Code Duplication

The system reuses existing logic:
- **Rate limiting:** Modified to use dynamic thresholds per account type
- **Request logging:** Enhanced to include risk data
- **Authentication:** Extended JWT payload, same flow

### Explainable Decisions

Every security action has a reason:
- Risk score breakdowns show exactly why
- Factor contributions are transparent
- Admin logs show policy mode applied

### Backward Compatibility

- Existing users default to SAVINGS account type
- All risk data optional in logs (graceful degradation)
- Admins see enhanced info; users see effects only

### Performance

- Risk calculation runs per-request (uses last 20-30 logs)
- In-memory rate limit tracking (fast)
- MongoDB aggregations for dashboard (batched)
- Minimal overhead on existing API endpoints

---

## Usage Example

### Scenario: Admin Monitors High-Risk User

1. **Admin logs in** (role: "admin")
2. **Opens Risk Analysis** (`/admin/risk-analysis`)
3. **Sees risk dashboard:**
   - Total users: 15
   - High risk: 2 users
   - Avg score: 35

4. **Clicks user "john_doe"** (SAVINGS account)
   - Risk score: 68 (HIGH)
   - Reasons:
     - High request rate (+30)
     - Repeated rate-limit violations (+25)
     - Sensitive endpoint access (+13)

5. **Takes action:**
   - Can investigate from Suspicious Activity page
   - Can send alert notification
   - User is automatically blocked for 15 minutes

### Scenario: User Experiences Security Effects

1. **User "john_doe" (SAVINGS)** makes request to `/api/balance`
2. **Threshold:** 10 requests/minute
3. **Current requests:** 11 in last minute
4. **System response:** 
   ```json
   {
     "statusCode": 429,
     "message": "Rate limit exceeded",
     "riskLevel": "MEDIUM"
   }
   ```
5. **After repeated violations:**
   - Risk score reaches HIGH (65+)
   - System blocks user for 15 minutes
   - Returns 403 status
   - User sees: "Due to unusually high request activity, access is temporarily restricted."

---

## Configuration & Fine-Tuning

### Adjustable Risk Weights

Edit `src/utils/riskScoring.js`:

```javascript
const RISK_WEIGHTS = {
  SAVINGS: {
    highRequestRate: 30,        // Increase for stricter
    rateLimitViolation: 25,
    sensitiveEndpoint: 20,
    failedAuth: 40,
  },
  CURRENT: {
    highRequestRate: 15,        // Lower = more tolerance
    rateLimitViolation: 15,
    sensitiveEndpoint: 10,
    failedAuth: 30,
  },
};
```

### Adjustable Rate Limits

Edit same file:

```javascript
const RATE_THRESHOLDS = {
  SAVINGS: {
    "/api/balance": 10,
    "/api/transfer": 3,
  },
  CURRENT: {
    "/api/balance": 20,         // Increase for higher throughput
    "/api/transfer": 5,
  },
};
```

### Detection Thresholds

Adjust in `riskScoring.js`:

```javascript
if (recentRequests > 20) {        // Change from 20 to X
  riskScore += weights.highRequestRate;
}
```

---

## Security Principles

✅ **Explainable:** Every admin decision has clear reasoning
✅ **Proportional:** Severity matches actual risk
✅ **Context-Aware:** Account type affects sensitivity
✅ **Non-Intrusive:** Users only see effects, not scores
✅ **Transparent:** Admin logs show all reasoning
✅ **Configurable:** Weights adjustable without code changes
✅ **Non-Blocking:** Doesn't replace existing rate limiting, augments it

---

## Testing Checklist

- [ ] User signs up with SAVINGS account type
- [ ] User signs up with CURRENT account type
- [ ] Profile displays correct account type + policy mode
- [ ] /api/balance respects SAVINGS limit (10) vs CURRENT (20)
- [ ] /api/transfer respects SAVINGS limit (3) vs CURRENT (5)
- [ ] Risk score increases with high request rate
- [ ] Risk score increases with rate-limit violations
- [ ] HIGH risk triggers 15-minute block (403)
- [ ] Admin sees risk dashboard
- [ ] Admin can investigate user and see risk analysis
- [ ] Suspicious activity shows risk scores and account types
- [ ] Admin can send alerts to high-risk users

---

## Metrics to Monitor

**Admin Dashboard shows:**
- Total risk-scored users
- Distribution (HIGH/MEDIUM/LOW)
- Average risk score
- User-specific breakdowns
- Contributing factors

**Real-time tracking:**
- Rate limit threshold changes per account type
- Risk score changes per user
- Blocks triggered by risk (not just rate limits)
- Most common risk factors

---

## Future Enhancements

- Risk score trend analysis (increasing/decreasing over time)
- Predictive blocking (pre-block before HIGH reached)
- Custom risk factors per endpoint
- Risk score decay (score drops over time with good behavior)
- Admin alerts when user risk reaches threshold
- Bulk policy changes (convert users between account types)
- Risk audit trail (show historical risk decisions)

---

## Support & Debugging

**Q: User blocked but risk score is LOW?**
A: Check ApiLog entries - 15-minute block from earlier violation may still be active

**Q: Risk score not updating?**
A: Ensure recent logs are in MongoDB; check risk factor thresholds

**Q: Account type not appearing in JWT?**
A: Verify auth controller includes accountType in jwt.sign payload

**Q: Suspicious Activity not showing risk data?**
A: Check ApiLog model has riskScore, riskLevel, riskFactors fields

