# 🚀 CHAINTRUST - POST-SECURITY AUDIT QUICK START

## ⚠️ IMPORTANT: READ THIS FIRST

The backend now requires proper environment configuration. The app will **CRASH ON PURPOSE** if security variables are missing.

---

## 📝 SETUP STEPS (5 Minutes)

### **Step 1: Create .env File**

Navigate to the backend server directory:

```bash
cd "D:\ChainTrust - Decentralized - Escrow\Backend\Server"
```

Copy the template:

```bash
# Windows Command Prompt
copy .env.example .env

# PowerShell
Copy-Item .env.example .env

# Git Bash / Linux / Mac
cp .env.example .env
```

---

### **Step 2: Generate JWT Secret**

You MUST generate a strong JWT secret. Choose one method:

#### **Option A: PowerShell (Windows)**

```powershell
$bytes = New-Object Byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

#### **Option B: OpenSSL (Linux/Mac/Git Bash)**

```bash
openssl rand -base64 32
```

#### **Option C: Online (Quick Test)**

Visit: https://generate-secret.vercel.app/32

---

### **Step 3: Configure .env File**

Open `.env` and update:

```env
# REQUIRED - Paste your generated secret here
JWT_SECRET=YOUR_GENERATED_SECRET_HERE

# Database - Update if using MongoDB Atlas
MONGO_URI=mongodb://localhost:27017/chaintrust

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL - Update for your setup
FRONTEND_URL=http://localhost:5173
```

**Example**:

```env
JWT_SECRET=K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=
MONGO_URI=mongodb://localhost:27017/chaintrust
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

### **Step 4: Verify MongoDB is Running**

Make sure MongoDB is running on your system:

#### **Windows**:

```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Start if stopped
Start-Service MongoDB
```

#### **Linux/Mac**:

```bash
# Check status
sudo systemctl status mongod

# Start if stopped
sudo systemctl start mongod
```

---

### **Step 5: Start the Server**

```bash
cd "D:\ChainTrust - Decentralized - Escrow\Backend\Server"
node server.js
```

**Expected Output**:

```
Server running on port 5000
MongoDB connected
```

**If you see errors**, read them carefully:

- `FATAL: JWT_SECRET is not defined` → Edit `.env` and add JWT_SECRET
- `FATAL: MONGO_URI is not defined` → Edit `.env` and add MONGO_URI
- `MongoDB connection error` → Start MongoDB service

---

## 🔒 SECURITY CHANGES SUMMARY

### **What Changed?**

1. **✅ CORS Protection**: Only allows requests from your frontend
2. **✅ Rate Limiting**: Prevents brute force attacks (10 login attempts / 15 min)
3. **✅ Security Headers**: Helmet adds XSS, clickjacking protection
4. **✅ JWT Security**: No weak fallback secrets allowed
5. **✅ Request Logging**: All API calls logged for debugging
6. **✅ Dispute Fixes**: Critical bugs fixed
7. **✅ State Locks**: Cannot modify disputed contracts
8. **✅ Double Funding Prevention**: Cannot fund contracts twice

### **What You Need to Do?**

1. ✅ Create `.env` file (see Step 1-3 above)
2. ✅ Generate strong JWT_SECRET
3. ✅ Start MongoDB
4. ✅ Start the backend server

**That's it!** Frontend works the same - no changes needed there.

---

## 🐛 TROUBLESHOOTING

### **Error: "FATAL: JWT_SECRET is not defined"**

**Problem**: No `.env` file or empty JWT_SECRET  
**Solution**:

```bash
# 1. Check if .env exists
ls .env

# 2. If not, create it
copy .env.example .env

# 3. Generate secret and add to .env
# Use one of the methods from Step 2
```

---

### **Error: "MongoDB connection error"**

**Problem**: MongoDB not running or wrong URI  
**Solution**:

```bash
# Check MongoDB status
# Windows:
Get-Service MongoDB

# Linux/Mac:
sudo systemctl status mongod

# If stopped, start it
# Windows:
Start-Service MongoDB

# Linux/Mac:
sudo systemctl start mongod
```

---

### **Error: "Not allowed by CORS"**

**Problem**: Frontend URL not in allowed list  
**Solution**: Edit `.env` and add your frontend URL:

```env
FRONTEND_URL=http://localhost:5173
```

Or if using different port:

```env
FRONTEND_URL=http://localhost:3000
```

---

### **Error: "Too many login attempts"**

**Problem**: Rate limit triggered (10 attempts / 15 min)  
**Solution**: Wait 15 minutes or restart server to reset

---

## 📊 TESTING THE SECURITY

### **Test 1: JWT Secret Validation**

1. Rename `.env` to `.env.backup`
2. Try to start server: `node server.js`
3. Should see: `FATAL: JWT_SECRET is not defined`
4. Rename back: `.env.backup` → `.env`

✅ **Result**: Server won't start without proper config

---

### **Test 2: Rate Limiting**

1. Open Postman or use curl
2. Try to login 11 times rapidly:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
```

3. 11th request should fail with rate limit error

✅ **Result**: Brute force attacks prevented

---

### **Test 3: CORS Protection**

1. Open browser console on random website (e.g., google.com)
2. Try to make request:

```javascript
fetch("http://localhost:5000/api/auth/me", {
  headers: { Authorization: "Bearer your-token" },
})
  .then((r) => r.json())
  .catch((e) => console.log("BLOCKED:", e));
```

3. Should see CORS error

✅ **Result**: Random websites can't access your API

---

## 📦 PACKAGE UPDATES

New security packages installed:

```json
{
  "helmet": "^7.1.0", // Security headers
  "express-rate-limit": "^7.1.5", // Rate limiting
  "morgan": "^1.10.0" // Request logging
}
```

These are already installed. No action needed.

---

## 🎯 PRODUCTION DEPLOYMENT

When deploying to production server:

1. **Generate new JWT_SECRET** (don't reuse development secret)
2. **Set `NODE_ENV=production`** in `.env`
3. **Update `FRONTEND_URL`** to production domain
4. **Use MongoDB Atlas** or secured MongoDB
5. **Enable HTTPS** on your server
6. **Review rate limits** in `server.js` (adjust if needed)

**Example Production .env**:

```env
JWT_SECRET=<NEW_SUPER_STRONG_SECRET>
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chaintrust
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://chaintrust.yourdomain.com
```

---

## ✅ VERIFICATION CHECKLIST

Before considering setup complete:

- [ ] `.env` file exists in `Backend/Server/`
- [ ] JWT_SECRET is set (minimum 32 characters)
- [ ] MongoDB is running
- [ ] Server starts without errors
- [ ] Can login from frontend
- [ ] No CORS errors in browser console
- [ ] Server logs show requests (Morgan working)

---

## 📞 NEED HELP?

1. Check [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) for detailed changes
2. Verify `.env` file has all required variables
3. Check MongoDB connection
4. Review server console logs
5. Test with Postman first before frontend

---

**Setup Time**: 5 minutes  
**Difficulty**: Easy  
**Status**: Ready to use with proper configuration

**Remember**: The app crashes on purpose if not configured properly. This is a security feature, not a bug! 🔒
