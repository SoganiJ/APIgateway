# ML Anomaly Detection Service

## Quick Start

1. **Install Python dependencies:**
```bash
cd ml-service
pip install -r requirements.txt
```

2. **Start the ML service:**
```bash
python app.py
```

Service will run on http://localhost:5001

3. **Start backend (from backend folder):**
```bash
npm start
```

4. **Start frontend (from frontend folder):**
```bash
npm run dev
```

## Usage

### 1. Train the Model
- Go to Admin Dashboard → **ML Anomaly Detection**
- Click **"Train Model"** button
- Model will train on last 24 hours of API traffic data
- Requires at least 10 samples

### 2. View Anomalies
- The page auto-refreshes every 10 seconds
- Shows all active users with their risk scores
- Color-coded risk levels:
  - 🟢 Green (< 0.5): Normal behavior
  - 🟡 Yellow (0.5-0.8): Monitor
  - 🟠 Orange (> 0.8): Throttle + Alert
  - 🔴 Red (> 0.9): Temporary Block

### 3. Adjust Time Window
- Use dropdown to change analysis window (5-60 minutes)
- Longer windows = more data = better detection

## Features Analyzed

1. **requests_per_minute** - Request rate
2. **burst_count** - Sudden request spikes
3. **unique_endpoints** - Number of endpoints accessed
4. **avg_interval_ms** - Average time between requests
5. **is_authenticated** - Authentication status
6. **time_of_day** - Hour of day (0-23)
7. **failed_requests** - Failed request count
8. **rate_limit_hits** - Rate limit violations

## API Endpoints

### Backend (Node.js)
- `GET /api/admin/ml/health` - Check ML service status
- `GET /api/admin/ml/anomalies?window=5` - Get all anomalies
- `GET /api/admin/ml/stats?window=5` - Get statistics
- `GET /api/admin/ml/anomalies/:userId` - Get user anomaly
- `POST /api/admin/ml/train` - Train model

### ML Service (Python)
- `GET /health` - Health check
- `POST /train` - Train model
- `POST /predict` - Predict single
- `POST /predict-batch` - Predict batch
- `GET /model-info` - Get model info

## Testing

1. **Generate traffic** using "Spam Requests" page (user side)
2. **Train the model** with generated data
3. **View anomalies** in real-time
4. **Simulate attacks** to see high risk scores

## Troubleshooting

**ML Service offline?**
- Check if Python service is running on port 5001
- Verify ML_SERVICE_URL in backend/.env

**No anomalies detected?**
- Generate more API traffic
- Train the model first
- Check time window (might be too short)

**Training fails?**
- Need at least 10 samples
- Check MongoDB connection
- Verify API logs exist in database
