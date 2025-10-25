# LiveAlive Health Check Service 🚀

A health check service that pings your Supabase projects once a day to prevent automatic shutdown. Users add URLs by domain. When searching for a domain on the main screen, all URLs belonging to that domain and their 7-day uptime history are displayed.

## 🎯 Features

- ✅ Daily automatic health check (every day at 03:00)
- 🔍 Domain-based search
- 📊 7-day uptime visualization
- 🎨 Modern and responsive UI (Tailwind CSS)
- 🔒 Rate limiting (spam protection)
- 📈 Uptime percentage calculation
- ⚡ Real-time status updates
- 🗑️ URL deletion feature

## 🛠️ Technology Stack

### Backend

- Node.js + Express
- MongoDB + Mongoose
- node-cron (scheduled tasks)
- axios (HTTP requests)
- express-rate-limit
- helmet (security)

### Frontend

- React (with Vite)
- Tailwind CSS
- axios
- react-toastify (notifications)
- date-fns (date formatting)

## 📁 Project Structure

```
liveAliveSupabase/
├── backend/
│   ├── server.js                 # Entry point
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── models/
│   │   ├── Url.js               # URL schema
│   │   └── HealthCheck.js       # Health check records schema
│   ├── routes/
│   │   └── urls.js              # API routes
│   ├── controllers/
│   │   └── urlController.js     # Business logic
│   ├── middleware/
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── errorHandler.js      # Error handling
│   ├── services/
│   │   └── cronService.js       # Cron job service
│   ├── utils/
│   │   └── domainExtractor.js   # Domain extraction utility
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Main component
    │   ├── main.jsx             # Entry point
    │   ├── components/
    │   │   ├── DomainSearch.jsx # Search component
    │   │   ├── UrlForm.jsx      # URL add modal
    │   │   ├── DomainResults.jsx # Results list
    │   │   ├── UrlCard.jsx      # URL card
    │   │   └── UptimeChart.jsx  # Uptime visualization
    │   ├── services/
    │   │   └── api.js           # API service
    │   └── utils/
    │       └── validation.js    # Validation functions
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd liveAliveSupabase
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file
# PORT=5000
# NODE_ENV=development
# MONGO_URI=mongodb://localhost:27017/livealive
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file
# VITE_API_URL=http://localhost:5000/api
```

### 4. MongoDB Setup

Make sure MongoDB is installed on your system.

**macOS (Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
[MongoDB Download Page](https://www.mongodb.com/try/download/community)

**Linux:**

```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**MongoDB Atlas (Cloud):**

- Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get the connection string
- Update `MONGO_URI` in `.env` file

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend will run at http://localhost:5001

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend will run at http://localhost:3000

### Production Build

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

## 📡 API Endpoints

### Base URL: `http://localhost:5001/api`

#### 1. Add URL

```http
POST /urls
```

**Body:**

```json
{
  "url": "https://example.com/api/health"
}
```

**Rate Limit:** 1 request/minute

**Response:**

```json
{
  "success": true,
  "message": "URL added successfully",
  "data": {
    "_id": "...",
    "url": "https://example.com/api/health",
    "domain": "example.com",
    "currentStatus": "pending"
  }
}
```

#### 2. Search Domain

```http
GET /domains/search?q=example.com
```

**Rate Limit:** 30 requests/minute

**Response:**

```json
{
  "success": true,
  "domain": "example.com",
  "urls": [
    {
      "_id": "...",
      "url": "https://example.com/api/health",
      "currentStatus": "active",
      "lastChecked": "2025-10-25T03:00:00Z",
      "lastResponseTime": 234,
      "history": [
        { "date": "2025-10-25", "status": "success", "responseTime": 234 },
        { "date": "2025-10-24", "status": "success", "responseTime": 189 }
      ]
    }
  ]
}
```

#### 3. List All URLs

```http
GET /urls
```

**Rate Limit:** 20 requests/minute

#### 4. Delete URL

```http
DELETE /urls/:id
```

**Rate Limit:** 20 requests/minute

#### 5. Get URL History

```http
GET /urls/:id/history?days=7
```

**Rate Limit:** 20 requests/minute

## ⏰ Cron Job

The cron job runs automatically every day at **03:00** (Turkey time) and:

1. Sends GET requests to all URLs (10 second timeout)
2. Creates HealthCheck records for each URL
3. Updates URL statuses (active/failed)
4. Waits 2 seconds between each URL

## 🔒 Security Features

- ✅ HTTP security headers with Helmet.js
- ✅ CORS protection
- ✅ Rate limiting (IP-based)
- ✅ Input validation
- ✅ MongoDB injection protection
- ✅ Error handling

## 📊 Rate Limiting

| Endpoint                | Limit       | Duration |
| ----------------------- | ----------- | -------- |
| POST /api/urls          | 1 request   | 1 minute |
| GET /api/domains/search | 30 requests | 1 minute |
| Other endpoints         | 20 requests | 1 minute |

## 🗄️ Database Schema

### URL Schema

```javascript
{
  url: String,              // required, unique
  domain: String,           // required, indexed
  createdAt: Date,          // default: Date.now
  lastChecked: Date,
  currentStatus: String,    // 'active', 'failed', 'pending'
  failCount: Number,        // default: 0
  lastResponseTime: Number  // milliseconds
}
```

### HealthCheck Schema

```javascript
{
  urlId: ObjectId,         // ref: 'Url', indexed
  date: Date,              // indexed, date only
  status: String,          // 'success', 'failed'
  responseTime: Number,    // milliseconds
  statusCode: Number,
  errorMessage: String,
  createdAt: Date          // TTL index: 8 days
}
```

## 🎨 Frontend Features

### Components

1. **DomainSearch**: Domain search (500ms debounce)
2. **UrlForm**: URL add modal (with rate limiting)
3. **DomainResults**: Search results list
4. **UrlCard**: URL card (status, metadata, delete)
5. **UptimeChart**: 7-day visualization

### Features

- ✅ Responsive design (mobile-friendly)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Rate limit countdown timer
- ✅ Confirm modals
- ✅ Uptime percentage calculation

## 🐛 Debugging

### Backend Logs

```bash
cd backend
npm run dev
```

Cron job logs:

```
⏰ Cron job started: Will run every day at 03:00
🏥 Starting health check...
📊 5 URLs to check
✓ https://example.com - Success (234ms)
✗ https://failed.com - Failed: Timeout (10 seconds)
✅ Health check completed (12.45 seconds)
```

### MongoDB Connection Issues

```bash
# Is MongoDB running?
brew services list

# Start MongoDB
brew services start mongodb-community

# Connect to MongoDB
mongosh

# List databases
show dbs

# Use LiveAlive database
use livealive

# Show collections
show collections
```

## 📝 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/livealive
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Production Deployment

### Backend (Heroku, Railway, Render)

1. Set environment variables
2. Use MongoDB Atlas connection string
3. Set `NODE_ENV=production`

### Frontend (Vercel, Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_URL` environment variable

## 🧪 Manual Health Check Trigger

For manual testing without waiting for cron job:

```javascript
// Add to backend/server.js
const { triggerManualCheck } = require("./services/cronService");

app.get("/api/trigger-check", async (req, res) => {
  await triggerManualCheck();
  res.json({ message: "Health check started" });
});
```

Then:

```bash
curl http://localhost:5001/api/trigger-check
```

## 📚 Used Packages

### Backend

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5",
  "node-cron": "^3.0.3",
  "axios": "^1.6.2",
  "express-validator": "^7.0.1"
}
```

### Frontend

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.2",
  "react-toastify": "^9.1.3",
  "date-fns": "^3.0.6",
  "tailwindcss": "^3.4.0"
}
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

## 💡 Tips

- To change cron job timezone, edit the timezone setting in `cronService.js`
- To change rate limit values, update the `rateLimiter.js` file
- To change TTL index duration, update the `expireAfterSeconds` value in `HealthCheck.js` model

## 🆘 Troubleshooting

### MongoDB Connection Error

```
MongoDB connection error: connect ECONNREFUSED
```

**Solution:** Make sure MongoDB service is running.

### Rate Limit Error

```
You can only add one URL per minute
```

**Solution:** Wait 60 seconds or reset with `localStorage.removeItem('lastUrlSubmit')`.

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution:** Change the port or kill the existing process:

```bash
lsof -ti:5001 | xargs kill -9
```

---

Made with ❤️ for keeping Supabase projects alive!
