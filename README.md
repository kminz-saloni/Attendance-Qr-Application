# Attendance QR Application

A modern attendance management system using QR codes for quick and secure attendance marking.

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Local Setup (Single Device)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Attendance-Qr-Application
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd web-app
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

---

## 🌐 Multi-Device Setup (Local Network)

### Step 1: Find Your Local IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (Wi-Fi/Ethernet).
Example: `172.24.203.216`

**Mac/Linux:**
```bash
ifconfig | grep "inet "
# or
ip addr show
```

### Step 2: Configure Backend (Django)

The backend is already configured to accept connections from your local network!

**Run the backend on all network interfaces:**
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

> ✅ **Already configured in `settings.py`:**
> - `ALLOWED_HOSTS` includes your local IP and wildcards
> - `CORS_ALLOW_ALL_ORIGINS = True` (for development)

### Step 3: Configure Frontend (React)

**Option A: Use Environment Variable (Recommended)**

Create a `.env` file in the `web-app` directory:
```env
REACT_APP_API_URL=http://172.24.203.216:8000
```

**Option B: Direct Configuration**

Update API calls in your React components to use your local IP instead of `localhost`.

### Step 4: Run Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```bash
cd web-app
npm start
# or
npm run dev
```

The React dev server automatically binds to `0.0.0.0`, making it accessible on your network.

### Step 5: Configure Windows Firewall

**Allow inbound connections for both ports:**

```powershell
# Allow Django (port 8000)
netsh advfirewall firewall add rule name="Django Dev Server" dir=in action=allow protocol=TCP localport=8000

# Allow React (port 3000)
netsh advfirewall firewall add rule name="React Dev Server" dir=in action=allow protocol=TCP localport=3000
```

**Or manually:**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Enter port `8000` (then repeat for `3000`)
6. Allow the connection → Next
7. Apply to all profiles → Next
8. Name it "Django Dev Server" / "React Dev Server"

### Step 6: Access from Other Devices

**Replace `172.24.203.216` with YOUR local IP address:**

- **Frontend:** `http://172.24.203.216:3000`
- **Backend API:** `http://172.24.203.216:8000`
- **Admin Panel:** `http://172.24.203.216:8000/admin`

**On mobile devices:**
- Connect to the same Wi-Fi network
- Open browser and navigate to `http://172.24.203.216:3000`
- Use QR scanner for attendance marking

---

## 🛠️ Troubleshooting

### Port Already in Use

**Find and kill the process:**

```powershell
# Step 1: Find the process using the port (e.g., port 3000)
netstat -ano | findstr :3000

# Step 2: Look for the PID (Process ID) in the last column
# Example output:
#   TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    30664
#                                                      ^^^^^ This is the PID

# Step 3: Kill the process using the PID
taskkill /PID 30664 /F
```

**Quick one-liner for port 3000:**
```powershell
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %a
```

### Cannot Access from Other Devices

1. **Check if both devices are on the same network**
   - Both must be connected to the same Wi-Fi

2. **Verify firewall rules**
   ```powershell
   netsh advfirewall firewall show rule name="Django Dev Server"
   netsh advfirewall firewall show rule name="React Dev Server"
   ```

3. **Test connectivity**
   ```powershell
   # From another device, ping your PC
   ping 172.24.203.216
   ```

4. **Check if servers are running**
   ```powershell
   netstat -ano | findstr :8000
   netstat -ano | findstr :3000
   ```

5. **Temporarily disable firewall (for testing)**
   ```powershell
   # Turn off (test only!)
   netsh advfirewall set allprofiles state off
   
   # Turn back on
   netsh advfirewall set allprofiles state on
   ```

### CORS Errors

If you see CORS errors in the browser console:
- Verify `CORS_ALLOW_ALL_ORIGINS = True` in `backend/attendance_app/settings.py`
- Restart the Django server
- Clear browser cache

### Database Connection Issues

```bash
# Check PostgreSQL is running
# Windows: Services → PostgreSQL
# Or restart it:
net stop postgresql-x64-14
net start postgresql-x64-14
```

---

## 📱 Mobile Device Setup

### For QR Code Scanning

1. **Connect to the same Wi-Fi** as your PC
2. **Open browser** on mobile device
3. **Navigate to:** `http://172.24.203.216:3000`
4. **Login** with student credentials
5. **Scan QR code** displayed by faculty

### Camera Permissions

- **iOS Safari:** Allow camera access when prompted
- **Android Chrome:** Allow camera access when prompted
- If denied, go to browser settings → Site permissions → Camera

---

## 🔧 Development Commands

### Backend
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server (localhost only)
python manage.py runserver

# Run server (network accessible)
python manage.py runserver 0.0.0.0:8000
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm start
# or
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

## 📊 Tech Stack

- **Backend:** Django 5.2, Django REST Framework, PostgreSQL
- **Frontend:** React 19, TypeScript, TailwindCSS
- **Authentication:** JWT (Simple JWT)
- **QR Code:** html5-qrcode, qrcode

---

## 🔐 Security Notes

> ⚠️ **Important:** The current configuration is for **development only**!

For production deployment:
- Change `DEBUG = False`
- Set specific `ALLOWED_HOSTS`
- Configure `CORS_ALLOWED_ORIGINS` with specific domains
- Use environment variables for secrets
- Set up HTTPS
- Use a production-grade server (Gunicorn, Nginx)

---

## 📝 License

[Your License Here]

---

## 👥 Contributors

[Your Name/Team]

---

## 📞 Support

For issues or questions, please open an issue on GitHub.