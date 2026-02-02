# 🚀 ChainTrust Marketplace - Quick Start Guide

## Prerequisites

- Node.js 16+ installed
- MongoDB running locally or connection string ready
- Git (optional)

---

## 🏃‍♂️ Quick Setup (5 minutes)

### Step 1: Start MongoDB

```bash
# If using local MongoDB
mongod

# Or ensure your MongoDB Atlas connection string is in .env
```

### Step 2: Configure Backend

```bash
cd Backend/Server

# Create .env file
echo "MONGO_URI=mongodb://localhost:27017/chaintrust
JWT_SECRET=your_super_secret_key_change_this_in_production
PORT=5000" > .env

# Install dependencies
npm install

# Start server
node server.js
```

Expected output:

```
Server running on port 5000
MongoDB connected successfully
```

### Step 3: Start Frontend

```bash
# Open new terminal
cd ChainTrust-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Expected output:

```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
```

---

## 👥 Test Users

### Create Test Accounts

#### Freelancer Account

1. Go to http://localhost:5173/register
2. Fill in:
   - Username: `john_dev`
   - Email: `john@test.com`
   - Password: `password123`
   - Role: **Freelancer**
3. Click Register

#### Client Account

1. Logout or use incognito window
2. Go to http://localhost:5173/register
3. Fill in:
   - Username: `jane_client`
   - Email: `jane@test.com`
   - Password: `password123`
   - Role: **Client**
4. Click Register

---

## 🎯 Testing the Marketplace

### As Client (jane_client)

1. **Login** → Redirects to `/client/dashboard`

2. **Navigate to "Find Freelancers"**
   - Click "🎯 Find Freelancers" in sidebar
   - OR go to http://localhost:5173/client/marketplace

3. **View Freelancer Cards**
   - Should see list of freelancers (including john_dev)
   - Each card shows:
     - Avatar with initial
     - Username and role badge
     - Star rating
     - Stats (completed, earnings, disputes)
4. **Search Freelancers**
   - Type in search box: "john"
   - Cards filter in real-time

5. **View Profile**
   - Click "👁️ View Profile" on any freelancer
   - Profile modal opens with:
     - Full user details
     - Reputation stats
     - Recent contracts (if any)
   - Close with X or click outside

6. **Invite Freelancer**
   - Click "📧 Invite" button
   - Confirmation modal appears
   - Click "Create Contract"
   - Redirects to `/client/create`
   - Freelancer pre-selected (future feature)

### As Freelancer (john_dev)

1. **Login** → Redirects to `/freelancer/dashboard`

2. **Navigate to Marketplace**
   - Click "🛒 Marketplace" in sidebar
   - OR go to http://localhost:5173/freelancer/marketplace

3. **View Contract Listings**
   - Should see available contracts
   - Each card shows:
     - Title, description, amount
     - Client name (clickable)
     - Deadline, applicants count
     - "Apply Now" button

4. **Filter Contracts**
   - Use budget dropdown:
     - 💵 < $500
     - 💸 $500 - $2000
     - 💎 > $2000
   - Search by title/description

5. **View Client Profile**
   - Click client name (cyan colored)
   - Profile modal opens
   - Shows client details

6. **Apply to Contract**
   - Click "🚀 Apply Now"
   - Button changes to "✅ Applied"
   - Application count increments

---

## 🧪 Testing Checklist

### Freelancer View ✅

- [ ] Marketplace shows contract listings
- [ ] Can search contracts
- [ ] Can filter by budget
- [ ] Client names are clickable
- [ ] Profile modal opens with client info
- [ ] Can apply to contracts
- [ ] Apply button disables after application
- [ ] Stats update correctly

### Client View ✅

- [ ] Marketplace shows freelancer cards
- [ ] Can search freelancers
- [ ] View Profile button works
- [ ] Profile modal shows freelancer stats
- [ ] Invite button appears for clients
- [ ] Invite confirmation modal works
- [ ] Redirects to create contract

### Both Roles ✅

- [ ] Loading skeletons appear during fetch
- [ ] Empty state shows when no results
- [ ] Error messages display on failure
- [ ] Mobile responsive (resize browser)
- [ ] Dark theme consistent
- [ ] Smooth animations

---

## 📊 Creating Test Data

### Create Contracts (as Client)

1. Login as `jane_client`
2. Go to "Create Contract"
3. Fill in:
   - Title: "Build E-commerce Website"
   - Description: "Need a full-stack developer..."
   - Amount: 1500
   - Deadline: Select future date
4. Click "Create Contract"

### Apply to Contracts (as Freelancer)

1. Login as `john_dev`
2. Go to Marketplace
3. Click "Apply Now" on available contract
4. Check "My Contracts" to see assigned work

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"

**Solution:**

```bash
# Check if backend is running
curl http://localhost:5000/auth/me

# Restart backend
cd Backend/Server
node server.js
```

### Issue: "No freelancers showing for client"

**Solution:**

- Ensure you've registered at least one freelancer account
- Check browser console for API errors
- Verify MongoDB has users with `role: "freelancer"`

### Issue: "ProfileModal not opening"

**Solution:**

- Check browser console for errors
- Ensure user ID exists in database
- Verify `/auth/user/:id` endpoint is working:
  ```bash
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    http://localhost:5000/auth/user/USER_ID
  ```

### Issue: "Invite button not working"

**Solution:**

- Check that you're logged in as a client
- Verify the route `/client/create` exists
- Check browser console for navigation errors

### Issue: "Apply Now button not working"

**Solution:**

- Ensure you're logged in as a freelancer
- Check contract status is "Created"
- Verify `/freelancer/apply/:id` endpoint:
  ```bash
  curl -X POST \
    -H "Authorization: Bearer YOUR_TOKEN" \
    http://localhost:5000/freelancer/apply/CONTRACT_ID
  ```

---

## 🎨 Visual Verification

### What You Should See

#### Client Marketplace

```
┌─────────────────────────────────────┐
│  🎯 Find Freelancers                │
│  Discover talented freelancers...   │
│                                     │
│  [Search box]                       │
│                                     │
│  ┌─────┐  ┌─────┐  ┌─────┐        │
│  │ 👤  │  │ 👤  │  │ 👤  │        │
│  │ John│  │ Mary│  │ Bob │        │
│  │ ⭐4.5│  │ ⭐5.0│  │ ⭐4.2│        │
│  │ 5✅  │  │ 12✅ │  │ 3✅  │        │
│  │ $2k │  │ $8k │  │ $1k │        │
│  │[View]│ │[View]│  │[View]│        │
│  │[📧]  │  │[📧]  │  │[📧]  │        │
│  └─────┘  └─────┘  └─────┘        │
└─────────────────────────────────────┘
```

#### Freelancer Marketplace

```
┌─────────────────────────────────────┐
│  🛒 Marketplace                     │
│  Browse and apply to contracts...   │
│                                     │
│  [Search box]  [💰 Filter]         │
│                                     │
│  ┌────────────────────────────┐    │
│  │ Build E-commerce Website    │    │
│  │ 👤 jane_client              │    │
│  │ Need full-stack developer...│    │
│  │ 💰 $1500  📅 10 days left   │    │
│  │ [🚀 Apply Now]              │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │ Mobile App Development      │    │
│  │ 👤 bob_startup              │    │
│  │ React Native app needed...  │    │
│  │ 💰 $3000  📅 20 days left   │    │
│  │ [🚀 Apply Now]              │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## 📱 Mobile Testing

1. **Open Chrome DevTools** (F12)
2. **Click Device Toolbar** (Ctrl+Shift+M)
3. **Select Device:**
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
4. **Test All Features**

Expected behavior:

- Sidebar collapses to hamburger menu
- Cards stack vertically
- Profile modal fills screen
- Touch targets large enough
- No horizontal scroll

---

## 🔐 Security Notes

### For Development

- Default JWT secret is weak - **DO NOT** use in production
- MongoDB without auth - fine for local testing
- CORS wide open - tighten before deployment

### For Production

1. **Change JWT Secret:**

   ```bash
   # Generate strong secret
   openssl rand -base64 32
   ```

2. **Secure MongoDB:**

   ```javascript
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
   ```

3. **Environment Variables:**
   - Never commit .env files
   - Use environment-specific configs
   - Enable HTTPS

4. **Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```

---

## 📚 API Quick Reference

### Marketplace Endpoints

```javascript
// Get freelancer list (clients)
GET /freelancers/list
Headers: { Authorization: "Bearer TOKEN" }
Response: [{ _id, username, email, role, reputation, completedContracts, totalEarnings, disputes }]

// Get user profile by ID
GET /auth/user/:id
Headers: { Authorization: "Bearer TOKEN" }
Response: { _id, username, email, role, walletAddress, reputation, createdAt }

// Get user contract stats
GET /contracts/user/:userId/stats
Headers: { Authorization: "Bearer TOKEN" }
Response: { completedContracts, totalEarnings, disputes, recentContracts[] }

// Get marketplace contracts (freelancers)
GET /contracts/marketpalce
Headers: { Authorization: "Bearer TOKEN" }
Response: [{ _id, title, description, amount, deadline, client, applicationsCount }]

// Apply to contract
POST /freelancer/apply/:id
Headers: { Authorization: "Bearer TOKEN" }
Response: { message, existingContract }
```

---

## 💡 Pro Tips

### Development Workflow

1. **Use React DevTools:**
   - Install browser extension
   - Inspect component props/state
   - Profile performance

2. **MongoDB Compass:**
   - Visual GUI for database
   - Easy data inspection
   - Query builder

3. **Postman/Thunder Client:**
   - Test API endpoints
   - Save collections
   - Environment variables

4. **Hot Reload:**
   - Backend: `npm install -g nodemon` → `nodemon server.js`
   - Frontend: Already has hot reload via Vite

### Debugging

```javascript
// Add to components for debugging
console.log("User role:", user?.role);
console.log("Contracts:", contracts);
console.log("Freelancers:", freelancers);

// Check API responses
try {
  const { data } = await api.get("/endpoint");
  console.log("API Response:", data);
} catch (err) {
  console.error("API Error:", err.response?.data);
}
```

---

## 🎉 Next Steps

After verifying the marketplace works:

1. **Customize Design:**
   - Update color scheme in Tailwind config
   - Add your logo to Sidebar
   - Customize badges and icons

2. **Add Features:**
   - Pagination for long lists
   - Advanced filters (skills, location, etc.)
   - Freelancer portfolio section
   - Direct messaging

3. **Deploy:**
   - Frontend: Vercel, Netlify, or Cloudflare Pages
   - Backend: Railway, Render, or DigitalOcean
   - Database: MongoDB Atlas

---

## 📞 Getting Help

### Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)

### Common Commands

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for updates
npm outdated

# Update packages
npm update
```

---

**🎊 You're all set!** The marketplace should now be fully functional with role-aware views and profile modals. Happy coding! 🚀
