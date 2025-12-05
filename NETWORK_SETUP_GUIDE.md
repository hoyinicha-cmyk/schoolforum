# Network Setup Guide - Para Ma-access ng Ibang Users

## Quick Setup (Local Network/LAN)

### Step 1: Get Your IP Address
```cmd
ipconfig
```
Hanapin yung **IPv4 Address** (example: `192.168.1.100`)

### Step 2: Update Frontend API URL

Buksan ang file: `frontend/src/utils/apiUrl.js`

I-update ang code:
```javascript
export const getApiBaseUrl = () => {
  // For local network access, use your computer's IP
  const hostname = window.location.hostname;
  
  // If accessing from other devices, use your IP
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000`;
  }
  
  // Default localhost
  return 'http://localhost:5000';
};
```

### Step 3: Update Backend CORS

Buksan ang file: `backend/src/server.js`

I-update ang CORS origin (line 18-24):
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://YOUR_IP_HERE:3000',  // Replace with your actual IP
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
```

### Step 4: Build Frontend for Network Access

```cmd
cd frontend
npm run build
```

### Step 5: Serve Frontend on Network

Install serve globally:
```cmd
npm install -g serve
```

Serve the build:
```cmd
cd frontend
serve -s build -l 3000
```

### Step 6: Start Backend

```cmd
cd backend
npm start
```

### Step 7: Access from Other Devices

Sa ibang devices (phone, laptop) na naka-connect sa same WiFi:

Open browser and go to:
```
http://YOUR_IP_ADDRESS:3000
```

Example: `http://192.168.1.100:3000`

---

## Option 2: Online Hosting (For Internet Access)

### Free Hosting Options:

1. **Render.com** (Recommended)
   - Free tier available
   - Easy deployment
   - Supports Node.js + MySQL

2. **Railway.app**
   - Free $5 credit monthly
   - Easy setup
   - Good for testing

3. **Vercel** (Frontend only)
   - Free for frontend
   - Need separate backend hosting

### Steps for Render.com:

1. Create account at render.com
2. Create new Web Service for backend
3. Create new Static Site for frontend
4. Create MySQL database
5. Update environment variables
6. Deploy!

---

## Troubleshooting

### Can't access from other devices?

1. **Check Firewall:**
   ```cmd
   # Allow ports 3000 and 5000
   netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
   netsh advfirewall firewall add rule name="Node 5000" dir=in action=allow protocol=TCP localport=5000
   ```

2. **Check if backend is running:**
   ```
   http://YOUR_IP:5000/api/health
   ```

3. **Check if frontend is accessible:**
   ```
   http://YOUR_IP:3000
   ```

### Database connection issues?

Make sure MySQL is configured to accept connections from network:
- Edit `my.ini` or `my.cnf`
- Set `bind-address = 0.0.0.0`
- Restart MySQL service

---

## Security Notes

⚠️ **For Local Network Testing:**
- Only accessible within your WiFi network
- Safe for testing with classmates
- No internet exposure

⚠️ **For Online Hosting:**
- Use strong passwords
- Enable HTTPS
- Set up proper environment variables
- Don't commit `.env` files to GitHub

---

## Current Configuration

Your system is currently set to:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- Database: `localhost:3306`

To enable network access, follow Step 2-7 above!
