# 🤖 ML Anomaly Detection - Quick Reference

## 🎯 Three Services Running

| Service | Command | Port | Status Check |
|---------|---------|------|--------------|
| **ML Service** | `cd ml-service && D:/Vault_Gate/.venv/Scripts/python.exe app.py` | 5001 | http://localhost:5001/health |
| **Backend** | `cd backend && npm start` | 5050 | http://localhost:5050/health |
| **Frontend** | `cd frontend && npm run dev` | 5174 | http://localhost:5174 |

## 📍 Access Points

- **Admin Login**: http://localhost:5174/login
- **ML Dashboard**: Navigate to "ML Anomaly Detection" in admin sidebar
- **User Dashboard**: Switch account to generate test traffic

## ⚡ Quick Start

```bash
# Terminal 1: ML Service
cd D:\Vault_Gate\ml-service
D:/Vault_Gate/.venv/Scripts/python.exe app.py

# Terminal 2: Backend
cd D:\Vault_Gate\backend
npm start

# Terminal 3: Frontend  
cd D:\Vault_Gate\frontend
npm run dev
```

## 🎮 First Time Setup

1. **Login as admin** → http://localhost:5174/login
2. **Go to ML Anomaly Detection** (sidebar)
3. **Click "Train Model"** (needs 10+ samples)
4. **View real-time anomalies** (auto-refreshes every 10s)

## 🧪 Generate Test Data

1. **Switch to user account**
2. **Go to "Spam Requests"**
3. **Click "Start Attack"**
4. **Return to admin ML dashboard**
5. **See anomalies with high risk scores**

## 🎨 Risk Score Colors

- 🟢 **< 50%** = Normal (Allow)
- 🟡 **50-80%** = Unusual (Monitor)  
- 🟠 **> 80%** = Suspicious (Throttle + Alert)
- 🔴 **> 90%** = Malicious (Temporary Block)

## 🔍 What Gets Detected

| Behavior | Detection |
|----------|-----------|
| Rapid requests | High `requests_per_minute` |
| Request bursts | Multiple `burst_count` |
| Endpoint scanning | High `unique_endpoints` |
| Fast intervals | Low `avg_interval_ms` |
| Failed requests | High `failed_requests` |
| Rate limit hits | Multiple `rate_limit_hits` |
| Late night activity | Unusual `time_of_day` |
| Unauthenticated | `is_authenticated=0` |

## 📊 Features Extracted

```javascript
{
  requests_per_minute: 22,    // Request rate
  burst_count: 5,             // Request spikes
  unique_endpoints: 3,        // Endpoints accessed
  avg_interval_ms: 120,       // Time between requests
  is_authenticated: 1,        // Auth status (0/1)
  time_of_day: 14,           // Hour (0-23)
  failed_requests: 4,        // Errors
  rate_limit_hits: 1         // 429 responses
}
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| ML Service offline | Start Python service on port 5001 |
| Training fails | Need 10+ samples - generate traffic |
| No anomalies shown | Adjust time window or generate traffic |
| Import errors | `pip install -r ml-service/requirements.txt` |

## 📁 Key Files

- `ml-service/app.py` - Flask ML API
- `ml-service/anomaly_detector.py` - Isolation Forest model
- `backend/src/routes/mlAnomaly.route.js` - Backend API
- `backend/src/services/featureExtraction.service.js` - Feature extraction
- `frontend/src/pages/admin/BehavioralAnomalies.jsx` - Dashboard

## 🎯 API Endpoints

### Backend
- `GET /api/admin/ml/health` - ML service status
- `GET /api/admin/ml/anomalies?window=5` - All anomalies
- `GET /api/admin/ml/stats?window=5` - Statistics
- `POST /api/admin/ml/train` - Train model

### ML Service (Python)
- `GET /health` - Health check
- `POST /predict` - Single prediction
- `POST /predict-batch` - Batch predictions
- `POST /train` - Train model

## ✅ Verification Checklist

- [ ] ML service running (port 5001)
- [ ] Backend running (port 5050)
- [ ] Frontend running (port 5174)
- [ ] Can login as admin
- [ ] ML dashboard loads
- [ ] ML service shows "Online"
- [ ] Can click "Train Model"
- [ ] Training succeeds
- [ ] Anomalies display in table
- [ ] Real-time updates working

---

**Status**: All systems operational! 🚀
