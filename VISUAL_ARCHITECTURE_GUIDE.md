# Visual Architecture Guide

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REQUEST FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. USER SIGNUP
   ┌──────────────────┐
   │ Frontend         │
   │ /signup          │
   └────────┬─────────┘
            │ Select: SAVINGS or CURRENT
            ▼
   ┌──────────────────────────────────────┐
   │ Backend POST /auth/register           │
   │ ├─ username: "john_doe"              │
   │ ├─ accountType: "SAVINGS"            │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ Create User in MongoDB               │
   │ {                                    │
   │   username: "john_doe",              │
   │   apiKey: "key_xxx",                 │
   │   accountType: "SAVINGS",            │
   │   role: "user"                       │
   │ }                                    │
   └──────────────────────────────────────┘

2. USER LOGIN
   ┌──────────────────┐
   │ Frontend         │
   │ /login           │
   │ Username + API   │
   │ Key              │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ Backend POST /auth/login             │
   │ ├─ Validate username + apiKey        │
   │ ├─ Create JWT with:                  │
   │ │  ├─ userId                         │
   │ │  ├─ role: "user"                   │
   │ │  └─ accountType: "SAVINGS" ◄─ NEW  │
   │ └─ Return token + accountType        │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ Frontend stores in localStorage:      │
   │ ├─ token (JWT)                       │
   │ ├─ apiKey                            │
   │ ├─ username                          │
   │ └─ Can decode to get accountType     │
   └──────────────────────────────────────┘

3. PROTECTED API CALL (e.g., /api/balance)
   ┌─────────────────────────────────────────────────────────┐
   │ USER REQUEST                                            │
   │ GET /api/balance                                        │
   │ Headers:                                                │
   │ ├─ Authorization: Bearer JWT                            │
   │ └─ x-api-key: key_xxx                                   │
   └────────┬────────────────────────────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────────────────────────────┐
   │ RATE LIMIT MIDDLEWARE (rateLimit.middleware.js)         │
   │                                                         │
   │ 1. Extract user from JWT                                │
   │    accountType: "SAVINGS"  ◄─ FROM JWT                  │
   │                                                         │
   │ 2. Check if user is BLOCKED                             │
   │    if (blockStatus[userId] && time < blockedUntil)      │
   │      return 403 (Forbidden)                             │
   │                                                         │
   │ 3. Get rate limit threshold                             │
   │    threshold = getRateLimitThreshold(                   │
   │      accountType: "SAVINGS",      ◄─ KEY DIFFERENCE    │
   │      endpoint: "/api/balance"                           │
   │    )                                                    │
   │    // Returns: 10 (SAVINGS) or 20 (CURRENT)             │
   │                                                         │
   │ 4. Check current request count in window                │
   │    count = 5 (requests in last minute)                  │
   │    if (count >= threshold)  // 5 < 10 ✓                │
   │                                                         │
   │ 5. Calculate RISK SCORE  ◄─────── NEW                  │
   │    riskData = calculateRiskScore({                      │
   │      userId,                                            │
   │      accountType: "SAVINGS",                            │
   │      userLogs: [...]    // Last 20 logs                 │
   │    })                                                   │
   │    // Returns:                                          │
   │    // {                                                 │
   │    //   score: 35,                                      │
   │    //   level: "MEDIUM",                                │
   │    //   factors: [...],                                 │
   │    //   action: "Throttled"                             │
   │    // }                                                 │
   │                                                         │
   │ 6. Log to MongoDB  ◄─── ENHANCED WITH RISK DATA         │
   │    await ApiLog.create({                                │
   │      userId,                                            │
   │      endpoint: "/api/balance",                          │
   │      method: "GET",                                     │
   │      statusCode: 200,                                   │
   │      accountType: "SAVINGS",        ◄─ NEW              │
   │      riskScore: 35,                 ◄─ NEW              │
   │      riskLevel: "MEDIUM",           ◄─ NEW              │
   │      riskFactors: [...]             ◄─ NEW              │
   │    })                                                   │
   │                                                         │
   │ 7. Allow request                                        │
   │    next()  // Continue to controller                    │
   │                                                         │
   │ RESULT: 200 OK                                          │
   └─────────────────────────────────────────────────────────┘

4. REPEATED VIOLATIONS SCENARIO
   ┌─────────────────────────────────────────────────────────┐
   │ SAME USER MAKES 12 RAPID REQUESTS                       │
   │                                                         │
   │ Request 1-10:  ✓ Allowed (under SAVINGS limit of 10)    │
   │ Request 11:    ✗ 429 Rate Limited (over limit)          │
   │                → Log with riskScore: 55 (MEDIUM)        │
   │ Request 12:    ✗ 429 Rate Limited (over limit again)    │
   │                → Log with riskScore: 60 (MEDIUM→HIGH)   │
   │                → Risk level crossed to HIGH              │
   │                → blockStatus[userId] set for 15 min      │
   │                → Return 429 + block triggered            │
   │                                                         │
   │ Request 13:    ✗ 403 FORBIDDEN (user blocked)           │
   │                → Block status still active              │
   │                → Return 403 for 15 minutes              │
   │                                                         │
   │ Request 14 (16 min later):  ✓ Allowed (block expired)   │
   └─────────────────────────────────────────────────────────┘
```

---

## Admin Risk Analysis Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. ADMIN OPENS RISK ANALYSIS PAGE
   ┌──────────────────────┐
   │ Browser              │
   │ /admin/risk-analysis │
   └────────┬─────────────┘
            │
            ▼
   ┌────────────────────────────────────────────────────────┐
   │ Frontend: RiskSecurityEngine.jsx                       │
   │ ├─ useEffect: Fetch /api/admin/risk-dashboard         │
   │ ├─ Auto-refresh: every 10 seconds                      │
   └────────┬───────────────────────────────────────────────┘
            │
            ▼
   ┌────────────────────────────────────────────────────────┐
   │ Backend GET /api/admin/risk-dashboard                  │
   │ ├─ Fetch all USERS (role="user")                       │
   │ ├─ For each user:                                      │
   │ │  ├─ Get recent 20 ApiLog entries                    │
   │ │  ├─ Calculate risk score                             │
   │ │  └─ Store in array                                   │
   │ ├─ Sort by risk score (HIGH first)                     │
   │ └─ Calculate summary statistics                        │
   └────────┬───────────────────────────────────────────────┘
            │
            ▼
   ┌────────────────────────────────────────────────────────┐
   │ RESPONSE JSON:                                         │
   │ {                                                      │
   │   "summary": {                                         │
   │     "totalUsers": 12,                                  │
   │     "highRiskCount": 2,      ◄─ HIGH RISK USERS        │
   │     "mediumRiskCount": 4,                              │
   │     "averageRiskScore": 34.5                           │
   │   },                                                   │
   │   "users": [                                           │
   │     {                                                  │
   │       "username": "john_doe",                          │
   │       "accountType": "SAVINGS",                        │
   │       "policyMode": "Conservative",                    │
   │       "riskScore": 68,                                 │
   │       "riskLevel": "HIGH",                             │
   │       "action": "Temporary block applied",             │
   │       "topRiskFactors": [                              │
   │         {                                              │
   │           "factor": "High request rate",               │
   │           "contribution": 30,                          │
   │           "details": "24 requests in 5 min"            │
   │         },                                             │
   │         {                                              │
   │           "factor": "Repeated violations",             │
   │           "contribution": 25,                          │
   │           "details": "3 rate limit hits"               │
   │         }                                              │
   │       ]                                                │
   │     },                                                 │
   │     ... more users                                    │
   │   ]                                                    │
   │ }                                                      │
   └────────┬───────────────────────────────────────────────┘
            │
            ▼
   ┌────────────────────────────────────────────────────────┐
   │ Frontend renders:                                      │
   │ ┌──────────────────────────────────────────────────┐   │
   │ │ Summary Cards                                    │   │
   │ │ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │   │
   │ │ │ Total: 12  │ │ HIGH: 2    │ │ Avg: 34.5    │  │   │
   │ │ └────────────┘ └────────────┘ └──────────────┘  │   │
   │ └──────────────────────────────────────────────────┘   │
   │ ┌──────────────────────────────────────────────────┐   │
   │ │ Risk Table                                       │   │
   │ │ User  │ Type    │ Score │ Level  │ Factors    │   │
   │ │───────┼─────────┼───────┼────────┼────────────│   │
   │ │john   │SAVINGS  │  68   │ HIGH   │ High rate  │   │
   │ │alice  │CURRENT  │  42   │MEDIUM  │ Rate limit │   │
   │ │bob    │SAVINGS  │  15   │ LOW    │ None       │   │
   │ └──────────────────────────────────────────────────┘   │
   └────────────────────────────────────────────────────────┘

2. ADMIN CLICKS "INVESTIGATE" ON HIGH-RISK USER
   ┌──────────────────────────────────────┐
   │ Click on "john_doe" (risk: 68)       │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────────────────┐
   │ Modal: InvestigateModal.jsx                          │
   │ ├─ Fetch /api/admin/user/:userId                    │
   │ ├─ Display user info:                                │
   │ │  ├─ Username: john_doe                             │
   │ │  ├─ Role: user                                     │
   │ │  ├─ Join date: 2026-01-15                          │
   │ │  └─ Recent API logs (10 entries)                   │
   │ │                                                    │
   │ ├─ Show alert form:                                  │
   │ │  ├─ Title: "Suspicious Activity"                   │
   │ │  ├─ Message: "Multiple rapid requests detected..."│
   │ │  ├─ Severity: HIGH                                 │
   │ │  └─ [Send Alert Button]                            │
   └────────┬──────────────────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────────────────┐
   │ Admin writes message + clicks Send Alert             │
   │ POST /api/admin/notify                               │
   │ {                                                    │
   │   "userId": "...",                                   │
   │   "title": "Suspicious Activity Detected",           │
   │   "message": "Your account...",                      │
   │   "type": "alert",                                   │
   │   "severity": "high",                                │
   │   "actionRequired": true                             │
   │ }                                                    │
   └────────┬──────────────────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────────────────┐
   │ Backend creates Notification in MongoDB              │
   │ Backend response: "Notification sent"                │
   └──────────────────────────────────────────────────────┘

3. USER SEES NOTIFICATION
   ┌──────────────────────────────────────┐
   │ User john_doe logs in               │
   │ Goes to /user/notifications         │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────────────────┐
   │ Frontend: Notifications.jsx                          │
   │ ├─ GET /api/notifications                            │
   │ ├─ Displays:                                         │
   │ │  ┌────────────────────────────────────────────┐   │
   │ │  │ [!] Suspicious Activity Detected (HIGH)    │   │
   │ │  │ Your account has been flagged...           │   │
   │ │  │ [✓ Mark Read]  [Details ▼]                 │   │
   │ │  └────────────────────────────────────────────┘   │
   │ │                                                    │
   │ └─ Auto-refreshes every 5 seconds                   │
   └──────────────────────────────────────────────────────┘
```

---

## Risk Score Calculation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│            RISK SCORE CALCULATION (calculateRiskScore)           │
└─────────────────────────────────────────────────────────────────┘

INPUT: { userId, accountType: "SAVINGS", userLogs: [...] }

STEP 1: Load weights based on account type
   SAVINGS:
   ├─ highRequestRate: 30
   ├─ rateLimitViolation: 25
   ├─ sensitiveEndpoint: 20
   └─ failedAuth: 40

   CURRENT:
   ├─ highRequestRate: 15     ◄─ LOWER (more tolerance)
   ├─ rateLimitViolation: 15
   ├─ sensitiveEndpoint: 10
   └─ failedAuth: 30

STEP 2: Analyze Factor 1 - High Request Rate
   ├─ Count requests in last 5 minutes
   ├─ SAVINGS threshold: > 20 requests
   ├─ User has: 24 requests
   ├─ TRIGGERED: Add +30 to score
   │
   └─ riskScore = 0 + 30 = 30
      riskFactors = ["High request rate (+30)"]

STEP 3: Analyze Factor 2 - Rate-Limit Violations
   ├─ Count 429 status codes in logs
   ├─ SAVINGS threshold: > 2 violations
   ├─ User has: 3 violations
   ├─ TRIGGERED: Add +25 to score
   │
   └─ riskScore = 30 + 25 = 55
      riskFactors += ["Repeated violations (+25)"]

STEP 4: Analyze Factor 3 - Sensitive Endpoint Access
   ├─ Count /transfer or /payment requests
   ├─ SAVINGS threshold: > 3 accesses
   ├─ User has: 5 accesses
   ├─ TRIGGERED: Add +20 to score
   │
   └─ riskScore = 55 + 20 = 75
      riskFactors += ["Sensitive endpoint access (+20)"]

STEP 5: Analyze Factor 4 - Failed Auth
   ├─ Count 401 status codes
   ├─ SAVINGS threshold: > 2 failures
   ├─ User has: 1 failure
   ├─ NOT TRIGGERED
   │
   └─ riskScore = 75 (unchanged)

STEP 6: Determine Risk Level
   Score: 75
   
   if (75 > 60)       → riskLevel = "HIGH"
   if (75 > 30)       → action = "Temporary block applied"
   else if (75 > 30)  → action = "Throttled / Restricted"
   else               → action = "Allowed"

OUTPUT:
{
  score: 75,
  level: "HIGH",
  action: "Temporary block applied",
  factors: [
    {
      factor: "High request rate",
      contribution: 30,
      details: "24 requests in last 5 minutes"
    },
    {
      factor: "Repeated rate-limit violations",
      contribution: 25,
      details: "3 rate limit hits detected"
    },
    {
      factor: "Repeated sensitive endpoint access",
      contribution: 20,
      details: "5 accesses to /transfer"
    }
  ]
}

INTERPRETATION:
├─ Admin sees: "Risk: 75 (HIGH) - Block applied"
├─ Reasons shown: Three factors explained
├─ Account context: "SAVINGS - Conservative policy"
└─ User sees: "Access temporarily restricted"
```

---

## Account Type Impact Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│            HOW ACCOUNT TYPE AFFECTS BEHAVIOR                     │
└─────────────────────────────────────────────────────────────────┘

SAVINGS ACCOUNT (Conservative)
├─ Rate Limits
│  ├─ /api/balance: 10 requests/minute
│  ├─ /api/transfer: 3 requests/minute
│  └─ Quickly hits rate limits
│
├─ Risk Scoring
│  ├─ highRequestRate weight: 30 (aggressive)
│  ├─ rateLimitViolation weight: 25 (high)
│  ├─ sensitiveEndpoint weight: 20 (high)
│  └─ Faster path to HIGH risk
│
├─ User Experience
│  ├─ Early rate limiting (after 10 requests)
│  ├─ Higher risk for normal usage patterns
│  ├─ Quick 15-minute blocks
│  └─ Good for: Security-sensitive accounts
│
└─ Policy Mode: "Conservative"

---

CURRENT ACCOUNT (High-Throughput)
├─ Rate Limits
│  ├─ /api/balance: 20 requests/minute
│  ├─ /api/transfer: 5 requests/minute
│  └─ 2x higher tolerance
│
├─ Risk Scoring
│  ├─ highRequestRate weight: 15 (gentle)
│  ├─ rateLimitViolation weight: 15 (lower)
│  ├─ sensitiveEndpoint weight: 10 (lower)
│  └─ Slower path to HIGH risk
│
├─ User Experience
│  ├─ Allows more burst traffic
│  ├─ Lower risk for similar usage
│  ├─ More lenient blocking
│  └─ Good for: Active trading/high-volume
│
└─ Policy Mode: "High-Throughput"

---

COMPARISON TABLE:

│ Metric              │ SAVINGS    │ CURRENT   │
├─────────────────────┼────────────┼───────────┤
│ Balance limit       │ 10 req/min │ 20 req/min│
│ Transfer limit      │ 3 req/min  │ 5 req/min │
│ Burst tolerance     │ LOW        │ HIGH      │
│ Risk weight (burst) │ 30         │ 15        │
│ Risk threshold      │ LOW (faster)│ HIGH (slower)
│ Block sensitivity   │ HIGH       │ LOW       │
│ Security level      │ Conservative│ Moderate │
│ Use case            │ Safe       │ Active    │
└─────────────────────┴────────────┴───────────┘
```

---

## Data Flow Through System

```
┌──────────────┐
│ User sends   │
│ request      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│ Extract JWT token                │
│ Get: userId, role, accountType   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Check if user blocked            │
│ Query: blockStatus[userId]       │
└──────┬───────────────────────────┘
       │
       ├─ Still blocked? → Return 403 ✗
       │
       ▼
┌──────────────────────────────────┐
│ Get rate limit threshold          │
│ Use: accountType + endpoint       │
│ SAVINGS + /balance = 10           │
│ CURRENT + /balance = 20           │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Count requests in last minute     │
│ Query: rateLimitStore[userId]    │
└──────┬───────────────────────────┘
       │
       ├─ Over threshold? → Go to Risk Calc
       │
       ▼
┌──────────────────────────────────┐
│ Calculate risk score              │
│ Query: ApiLog.find({userId})      │
│ Analyze: 4 behavioral factors     │
│ Weights: Different per accountType│
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Log to MongoDB (ApiLog)           │
│ Store: accountType, riskScore,    │
│        riskLevel, riskFactors     │
└──────┬───────────────────────────┘
       │
       ├─ Risk = HIGH? → Set block for 15 min
       │
       ▼
┌──────────────────────────────────┐
│ Return response                  │
│ ├─ Allowed (200) ✓               │
│ ├─ Rate limited (429) ✗          │
│ └─ Blocked (403) ✗               │
└──────────────────────────────────┘
```

---

This visual guide shows:
1. The complete request lifecycle
2. How admin intelligence works
3. Risk score calculation in detail
4. Account type impacts
5. Data flow through the system

All features work together seamlessly without disrupting existing functionality.

