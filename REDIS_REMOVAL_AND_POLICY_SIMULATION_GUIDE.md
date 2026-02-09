# Redis Removal & Policy Simulation Guide

## ✅ Redis Removal - COMPLETED

### What Was Removed:
- **ioredis package** - Uninstalled from dependencies
- **Redis initialization** - Removed `connectRedis()` call from `server.js`
- **Redis client imports** - Removed from gateway rate limit middleware
- **Redis rate limiting logic** - Removed `checkRedisRateLimit()` function

### What Changed:
The application now uses **in-memory rate limiting only** instead of Redis. This is perfect for development and works reliably for smaller deployments.

**Files Modified:**
- `backend/src/server.js` - Removed Redis connection logic
- `backend/src/middleware/gatewayRateLimit.middleware.js` - Now uses only in-memory storage
- `backend/src/config/redis.js` - No longer called (can be deleted)
- `backend/package.json` - ioredis removed

### Server Status:
```
✅ Server running on port 5050
✅ MongoDB connected successfully
✅ No Redis errors
```

---

## 📊 Policy Simulation Engine - How It Works

### Overview
The **Policy Simulation Engine** allows administrators to preview the impact of setting new rate limits and risk thresholds **WITHOUT enforcing them**. It's a decision-support tool, not an enforcement tool.

### Architecture

```
Frontend (React)
    ↓ (POST to /api/admin/simulate-policy)
    ↓
Backend Route Handler (adminSimulation.routes.js)
    ↓ (validates admin auth)
    ↓
Policy Simulation Service (policySimulation.service.js)
    ↓ (queries MongoDB)
    ↓
ApiLog Database (MongoDB collection)
    ↓ (returns impact analysis)
    ↓
Backend returns results
    ↓
Frontend displays visualization
```

### Step-by-Step Flow

#### 1. **Frontend Input** (`PolicySimulation.jsx`)
User selects simulation parameters:
```javascript
{
  accountType: "SAVINGS" | "CURRENT",    // User account type
  endpoint: "/payment" | "/balance",      // API endpoint to analyze
  rateLimit: 100,                         // Requests per hour
  riskThreshold: 60                       // Risk score (0-100)
}
```

#### 2. **Backend Route Handler** (`adminSimulation.routes.js`)
```javascript
POST /api/admin/simulate-policy
├─ Verifies admin authentication
├─ Validates required parameters
└─ Calls simulatePolicyImpact() service
```

#### 3. **Policy Simulation Service** (`policySimulation.service.js`)
Performs a complex MongoDB aggregation pipeline:

```
Step A: Normalize Input
  └─ Maps endpoint aliases ("/payment" → "/api/transfer")
  └─ Ensures numeric values for rateLimit & riskThreshold

Step B: Query Last 60 Minutes of Traffic
  └─ Filters ApiLog by:
     • createdAt >= now - 60 minutes
     • endpoint = policy.endpoint
     • accountType = policy.accountType

Step C: Calculate Risk Scores (MongoDB aggregation)
  └─ For each request, determine fallbackRisk:
     • isBlocked = true → risk: 95
     • statusCode 429 → risk: 70
     • statusCode ≥ 500 → risk: 85
     • statusCode ≥ 400 → risk: 60
     • otherwise → risk: 0
  
  └─ Take MAX of (stored riskScore, fallbackRisk)

Step D: Group by User & Calculate Metrics
  └─ For each userId:
     • requestCount = total requests in window
     • maxRisk = maximum risk score

Step E: Calculate Impact
  ├─ affectedUsers = total unique users found
  ├─ throttledUsers = users exceeding rateLimit
  ├─ restrictedUsers = users exceeding riskThreshold
  └─ throttledPercentage = (throttledUsers / affectedUsers) * 100
  └─ restrictedPercentage = (restrictedUsers / affectedUsers) * 100

Step F: Estimate Impact Level
  └─ HIGH: combined impact ≥ 30%
  └─ MEDIUM: combined impact ≥ 10%
  └─ LOW: combined impact < 10%
```

### Example Calculation

**Scenario:** Simulate a 100 requests/hour limit on SAVINGS account /payment endpoint

**Historical Data (last 60 minutes):**
```
User A: 150 requests, max risk 45
User B: 80 requests, max risk 75
User C: 120 requests, max risk 30
```

**Analysis:**
```
Affected Users: 3

Throttled Users: 
  - User A: 150 > 100 ✓
  - User B: 80 < 100 ✗
  - User C: 120 > 100 ✓
  Count: 2 → 66.7%

Restricted Users (risk ≥ 60):
  - User A: 45 < 60 ✗
  - User B: 75 ≥ 60 ✓
  - User C: 30 < 60 ✗
  Count: 1 → 33.3%

Combined Impact: MAX(66.7%, 33.3%) = 66.7% → HIGH IMPACT
```

**Result returned to frontend:**
```json
{
  "affectedUsers": 3,
  "throttledPercentage": 66.7,
  "restrictedUsers": 1,
  "estimatedImpact": "HIGH"
}
```

### Frontend Display (`SimulationResultCard.jsx`)

```
┌─────────────────────────────────────────┐
│  Simulation Results                     │
├─────────────────────────────────────────┤
│ Affected Users: 3                       │
│ Throttled %: 66.7%                      │
│ Estimated Impact: HIGH ⚠️               │
│ Restricted Users: 1                     │
└─────────────────────────────────────────┘
```

**Impact Levels:**
- 🟢 **LOW** (< 10%): Safe to deploy
- 🟡 **MEDIUM** (10-30%): Proceed with caution
- 🔴 **HIGH** (≥ 30%): May need refinement

---

## 🔄 Data Sources

### ApiLog Collection
The policy simulation queries the `ApiLog` MongoDB collection which contains:

```javascript
{
  userId: ObjectId,              // User who made request
  endpoint: "/api/transfer",     // Which API was called
  method: "POST",                // HTTP method
  statusCode: 200,               // Response code
  ipAddress: "192.168.1.100",   // Source IP
  isBlocked: false,              // Was request blocked?
  reason: "Rate limit exceeded", // Why blocked (if applicable)
  accountType: "SAVINGS",        // User account type
  riskScore: 75,                 // Calculated risk (0-100)
  riskLevel: "HIGH",             // Risk category
  riskFactors: [                 // What contributed to risk
    {
      factor: "High transaction volume",
      contribution: 45,
      details: "150 requests in 60 minutes"
    }
  ],
  createdAt: timestamp,          // When request happened
  updatedAt: timestamp
}
```

---

## 🛡️ Rate Limiting (Now In-Memory)

### Configuration
```javascript
AUTHENTICATED USERS:
  • MAX_REQUESTS: 100 per minute
  • BLOCK_DURATION: 5 minutes
  • Identifier: user._id

ANONYMOUS USERS:
  • MAX_REQUESTS: 50 per minute
  • BLOCK_DURATION: 10 minutes
  • Identifier: IP address
```

### How It Works
1. Request comes in → extract identifier (userId or IP)
2. Check memory store for recent requests in 60-second window
3. Count requests in window
4. If count > limit → block and return 429 status
5. Otherwise → log request timestamp and allow through

### In-Memory Storage
```javascript
memoryStore: Map<identifier, timestamps[]>
  └─ Stores array of request timestamps per user/IP

blockedStore: Map<identifier, {until: timestamp}>
  └─ Tracks which users are blocked and until when
```

**Pros:** Simple, fast, no external dependencies
**Cons:** Lost on server restart, not shared across multiple servers

---

## 🚀 Testing the Policy Simulation

### Using Admin Account
1. Login as admin user
2. Navigate to "Policy Simulation" page
3. Adjust parameters:
   - Account Type: SAVINGS or CURRENT
   - Endpoint: /payment or /balance
   - Rate Limit: Set requests/hour threshold
   - Risk Threshold: Set risk score threshold (0-100)
4. Click "Simulate Policy"
5. Review impact prediction

### Expected Response Format
```json
{
  "affectedUsers": 5,
  "throttledPercentage": 45.3,
  "restrictedUsers": 2,
  "estimatedImpact": "MEDIUM"
}
```

---

## 📝 Key Features

✅ **Non-destructive** - Simulation never modifies actual policies
✅ **Historical Analysis** - Uses last 60 minutes of real traffic
✅ **Risk-aware** - Considers both rate limits AND risk scores
✅ **Admin-only** - Requires authentication and admin role
✅ **Real-time** - Analyzes current MongoDB data
✅ **Three-level Impact** - LOW/MEDIUM/HIGH assessment

---

## 🔧 Troubleshooting

### Simulation returns "affectedUsers: 0"
- **Cause:** No traffic in last 60 minutes for selected endpoint/account type
- **Fix:** Generate some traffic first, or check your endpoint/account type filters

### Wrong impact calculation
- **Check:** Verify ApiLog entries have correct statusCode and riskScore values
- **Debug:** Connect to MongoDB and query directly:
  ```javascript
  db.apilogs.find({endpoint: "/api/transfer", accountType: "SAVINGS"})
  ```

### Authentication error
- **Cause:** User doesn't have admin role
- **Fix:** Use admin credentials or update user role in database

---

## 📚 Related Files
- Backend Service: `backend/src/services/policySimulation.service.js`
- Backend Route: `backend/src/routes/adminSimulation.routes.js`
- Frontend Page: `frontend/src/pages/PolicySimulation.jsx`
- Result Component: `frontend/src/components/SimulationResultCard.jsx`
- Data Model: `backend/src/models/ApiLog.js`
- Rate Limiting: `backend/src/middleware/gatewayRateLimit.middleware.js`
