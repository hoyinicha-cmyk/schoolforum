# 🚀 Quick Start - Para Ma-access ng Ibang Users

## Super Easy Method (3 Steps!)

### 1. Run the network setup script
```cmd
start-network.bat
```

Yan lang! Automatic na:
- ✅ Kukunin yung IP address mo
- ✅ I-setup yung firewall
- ✅ Mag-start ng backend at frontend
- ✅ Makikita mo yung URL na ibibigay sa iba

### 2. Share the URL
Makikita mo sa console yung URL, example:
```
http://192.168.1.100:3000
```

I-share mo yan sa classmates mo na naka-connect sa same WiFi!

### 3. Test it!
- Buksan mo sa phone mo yung URL
- Pag gumana, ibigay mo na sa iba!

---

## Manual Method (Kung ayaw gumana yung script)

### Step 1: Get your IP
```cmd
ipconfig
```
Hanapin yung IPv4 Address (example: 192.168.1.100)

### Step 2: Start servers
```cmd
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

### Step 3: Share URL
```
http://YOUR_IP:3000
```

---

## Troubleshooting

### "Can't connect" error?

**Option 1: Disable Firewall temporarily**
```cmd
netsh advfirewall set allprofiles state off
```

**Option 2: Add firewall rules manually**
```cmd
netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Node 5000" dir=in action=allow protocol=TCP localport=5000
```

### "CORS error" in browser?

Backend is already configured to accept local network connections. Just restart the backend:
```cmd
cd backend
npm start
```

### Database connection error?

Make sure MySQL is running:
```cmd
net start MySQL80
```

---

## Testing with Multiple Users

1. **User 1 (You):** Access via `http://localhost:3000`
2. **User 2 (Classmate):** Access via `http://YOUR_IP:3000`
3. **User 3 (Phone):** Access via `http://YOUR_IP:3000`

All users will share the same database and can:
- ✅ Chat with each other in real-time
- ✅ Mention each other (@username)
- ✅ Follow each other
- ✅ Post threads and reply
- ✅ React to posts

---

## Important Notes

⚠️ **Requirements:**
- All users must be on the SAME WiFi network
- Your computer must stay ON and running the servers
- MySQL must be running

✅ **Safe for testing:**
- Only accessible within your WiFi
- Not exposed to the internet
- Perfect for school/home testing

🎯 **Ready for production?**
- See `NETWORK_SETUP_GUIDE.md` for online hosting options
- Consider Render.com or Railway.app for free hosting

---

## Current Status

Your system is now configured to accept connections from:
- ✅ localhost (127.0.0.1)
- ✅ Your computer's IP
- ✅ Any device on local network (192.168.x.x, 10.x.x.x)

Just run `start-network.bat` and you're good to go! 🚀
