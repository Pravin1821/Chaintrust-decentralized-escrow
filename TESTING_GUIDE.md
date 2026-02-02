# ChainTrust Marketplace - Visual Testing Guide

## 🧪 Complete Testing Workflow

### Prerequisites

- Backend server running on port 5000
- Frontend running on port 5173 (or configured port)
- At least 2 user accounts: 1 client + 1 freelancer
- MongoDB connected and User model updated

---

## 📱 Test Scenario 1: Freelancer Applies to Contract

### Setup

1. **Login as Client**
   - Navigate to `/login`
   - Credentials: client account
   - Should redirect to `/client/dashboard`

2. **Create a Contract**
   - Navigate to `/client/create`
   - Fill in contract details:
     - Title: "Build React E-commerce App"
     - Description: "Need a full-stack developer..."
     - Amount: $1500
     - Deadline: Select future date
   - Click "Create Contract"
   - ✅ **Verify**: Status is "Created"

3. **Login as Freelancer**
   - Logout client
   - Login with freelancer credentials
   - Should redirect to `/freelancer/dashboard`

4. **View Marketplace**
   - Navigate to `/freelancer/marketplace`
   - ✅ **Verify**: See the contract you created
   - ✅ **Verify**: Button shows "🚀 Apply Now"

5. **Apply to Contract**
   - Click "🚀 Apply Now"
   - ✅ **Expected**: Button changes to "✅ Applied - Awaiting client response"
   - ✅ **Expected**: Button is now disabled (cursor-not-allowed)
   - ✅ **Backend Check**: `contract.applications` array has your freelancer ID

6. **Try Duplicate Application**
   - Refresh the page
   - Try clicking the apply button again
   - ✅ **Expected**: Still shows "✅ Applied" (button disabled)
   - ✅ **Expected**: No error, just disabled state

### Visual Indicators

- **Before Apply**: Gradient cyan-to-blue button with shadow
- **After Apply**: Green background with green border, no hover effect
- **Loading State**: "Applying..." text while API call is in progress

### Console Checks

```javascript
// Backend console should show:
// POST /freelancer/apply/:id - 200 OK

// Frontend console should show:
// Applied successfully to contract
```

---

## 📱 Test Scenario 2: Client Assigns Freelancer

### Setup

1. **Login as Client**
   - Navigate to `/login`
   - Login with client credentials

2. **View Contract Details**
   - Navigate to `/client/contracts`
   - Click on the contract that has applications
   - ✅ **Verify**: Status badge shows "Created"
   - ✅ **Verify**: See "👥 View Applications (1)" button

3. **View Applications**
   - Click "👥 View Applications"
   - ✅ **Expected**: Applications section expands below
   - ✅ **Expected**: See freelancer's username in cyan color
   - ✅ **Expected**: See "Applied: [date]" timestamp
   - ✅ **Expected**: See "✅ Assign" button next to freelancer

4. **View Freelancer Profile (Optional)**
   - Click on freelancer's username
   - ✅ **Expected**: ProfileModal opens
   - ✅ **Expected**: See reputation, stats, completed contracts

5. **Assign Freelancer**
   - Click "✅ Assign" button
   - ✅ **Expected**: Button shows "Assigning..." while processing
   - ✅ **Expected**: Alert: "Freelancer assigned successfully!"
   - ✅ **Expected**: Page refreshes/updates
   - ✅ **Expected**: Status changes to "Assigned"
   - ✅ **Expected**: New action button appears: "💰 Fund Escrow"

### Visual Indicators

- **Applications List**: Dark gray cards with freelancer info
- **Assign Button**: Green gradient (green-600 to emerald-600)
- **Success State**: Status badge changes from gray/blue to purple
- **New Action**: Fund Escrow button with cyan gradient

### Console Checks

```javascript
// Backend console:
// POST /contracts/assignFreelancer/:id - 200 OK

// Frontend console:
// Freelancer assigned successfully
// Contract status: Assigned
```

---

## 📱 Test Scenario 3: Client Funds Escrow

### Setup

1. **Continuing from Scenario 2**
   - Contract status should be "Assigned"
   - Should see "💰 Fund Escrow" button

2. **Fund the Contract**
   - Click "💰 Fund Escrow" button
   - ✅ **Expected**: Button shows "Processing..." while API call runs
   - ✅ **Expected**: Alert: "Escrow funded successfully!"
   - ✅ **Expected**: Page refreshes/updates
   - ✅ **Expected**: Status changes to "Funded"
   - ✅ **Expected**: Button changes to info box: "⏳ Escrow funded - Freelancer is working"

### Visual Indicators

- **Before Funding**: Cyan-to-blue gradient button
- **Loading**: "Processing..." text, button disabled
- **After Funding**: Blue info box with border, no button

### Backend Validation Checks

Try these **negative tests**:

#### Test 3A: Try to Fund Without Assigning First

1. Create new contract (status: "Created")
2. Try to call fund API directly
3. ✅ **Expected**: 400 Error - "Status must be Assigned"

#### Test 3B: Try to Fund Twice

1. After funding once
2. Try to fund again
3. ✅ **Expected**: 400 Error - "Contract already funded"

---

## 📱 Test Scenario 4: State-Based Button Display (Freelancer)

### Setup

1. **Create Multiple Contracts** with different statuses
2. **Login as Freelancer**

### Test Each State

#### State: Created (Not Applied)

- ✅ Button: "🚀 Apply Now"
- ✅ Color: Cyan-to-blue gradient
- ✅ Clickable: Yes
- ✅ Hover: Shadow effect

#### State: Created (Applied)

- ✅ Button: "✅ Applied - Awaiting client response"
- ✅ Color: Green background with green border
- ✅ Clickable: No (cursor-not-allowed)

#### State: Applied

- ✅ Button: "⏳ Applications under review"
- ✅ Color: Yellow background with yellow border
- ✅ Clickable: No

#### State: Assigned

- ✅ Button: "👤 Freelancer assigned - Awaiting funding"
- ✅ Color: Purple background with purple border
- ✅ Clickable: No

#### State: Funded

- ✅ Button: "💰 Work in progress"
- ✅ Color: Blue background with blue border
- ✅ Clickable: No

#### State: Submitted

- ✅ Button: "📋 Work submitted - Awaiting approval"
- ✅ Color: Cyan background with cyan border
- ✅ Clickable: No

#### State: Approved/Paid

- ✅ Button: "✅ Contract completed"
- ✅ Color: Green background with green border
- ✅ Clickable: No

#### State: Disputed

- ✅ Button: "⚠️ Under dispute resolution"
- ✅ Color: Red background with red border
- ✅ Clickable: No

#### State: Resolved

- ✅ Button: "🔒 Dispute resolved"
- ✅ Color: Gray background with gray border
- ✅ Clickable: No

---

## 📱 Test Scenario 5: State-Based Actions (Client)

### Setup

1. **Login as Client**
2. **Test each contract state**

### State Testing Matrix

| Status                | Expected Action   | Button Text              | Color           |
| --------------------- | ----------------- | ------------------------ | --------------- |
| Created               | View applications | 👥 View Applications (N) | Purple gradient |
| Assigned (not funded) | Fund escrow       | 💰 Fund Escrow           | Cyan gradient   |
| Assigned (funded)     | Info display      | ⏳ Escrow funded         | Blue info box   |
| Funded                | Info display      | 💼 Work in progress      | Blue info box   |
| Submitted             | Approve work      | ✅ Approve Work          | Green gradient  |
| Approved/Paid         | Info display      | ✅ Contract completed    | Green info box  |
| Disputed              | Info display      | ⚠️ Under dispute         | Red info box    |

### Testing Each State

#### State: Created

1. ✅ **Verify**: "👥 View Applications (N)" button visible
2. Click button
3. ✅ **Verify**: Applications section expands
4. ✅ **Verify**: See list of applicants (or "No applications yet")
5. ✅ **Verify**: Each applicant has "✅ Assign" button

#### State: Assigned (Not Funded)

1. ✅ **Verify**: "💰 Fund Escrow" button visible
2. ✅ **Verify**: Help text: "Fund the contract to allow work to begin"
3. Click button
4. ✅ **Verify**: Status changes to "Funded"

#### State: Funded

1. ✅ **Verify**: Info box displays "💼 Work in progress"
2. ✅ **Verify**: No action buttons visible
3. ✅ **Verify**: Help text: "Waiting for submission"

#### State: Submitted

1. ✅ **Verify**: "✅ Approve Work" button visible
2. ✅ **Verify**: Help text: "Review and approve the submitted work"
3. Click button
4. ✅ **Verify**: Alert: "Work approved successfully!"
5. ✅ **Verify**: Status changes to "Paid"

---

## 📱 Test Scenario 6: Error Handling

### Test 6A: Apply to Non-Created Contract

1. Login as freelancer
2. Use browser console or Postman
3. Try to apply to contract with status "Assigned"

```javascript
// POST /freelancer/apply/:id
// Expected: 400 Error
{
  "message": "Can only apply to Created contracts"
}
```

### Test 6B: Non-Client Tries to Assign

1. Login as freelancer
2. Try to call assign API

```javascript
// POST /contracts/assignFreelancer/:id
// Expected: 403 Forbidden
{
  "message": "Unauthorized"
}
```

### Test 6C: Assign Without Application

1. Login as client
2. Try to assign freelancer who hasn't applied

```javascript
// POST /contracts/assignFreelancer/:id
// Expected: 400 Error
{
  "message": "Freelancer has not applied to this contract"
}
```

### Test 6D: Fund Without Assignment

1. Create contract (status: "Created")
2. Try to fund it directly

```javascript
// POST /contracts/fundContract/:id
// Expected: 400 Error (middleware blocks)
// Status must be "Assigned"
```

### Test 6E: Approve Without Submission

1. Contract status is "Funded"
2. Try to approve it

```javascript
// POST /contracts/approveWork/:id
// Expected: 400 Error
{
  "message": "Only Submitted contracts can be approved"
}
```

---

## 📱 Test Scenario 7: Mobile Responsiveness

### Test on Different Screen Sizes

#### Mobile (< 640px)

1. Open Chrome DevTools
2. Set device to iPhone SE (375px)
3. Navigate to marketplace
4. ✅ **Verify**: Cards stack vertically
5. ✅ **Verify**: Buttons are full width
6. ✅ **Verify**: Text is readable (text-sm, text-xs)
7. ✅ **Verify**: No horizontal scroll

#### Tablet (640px - 1024px)

1. Set device to iPad (768px)
2. ✅ **Verify**: 2-column grid for contracts
3. ✅ **Verify**: Stats row shows 2-3 items
4. ✅ **Verify**: Buttons have proper spacing

#### Desktop (> 1024px)

1. Full screen browser
2. ✅ **Verify**: 2-3 column grid
3. ✅ **Verify**: All content visible
4. ✅ **Verify**: Hover effects work

---

## 📱 Test Scenario 8: Profile Modal

### Test from Marketplace

1. Login as client
2. Navigate to `/client/marketplace`
3. Find a freelancer card
4. Click "View Profile"
5. ✅ **Verify**: Modal opens with dark overlay
6. ✅ **Verify**: Freelancer details visible
7. ✅ **Verify**: Stats show: reputation, completed, earnings, disputes
8. ✅ **Verify**: Skills badges visible
9. ✅ **Verify**: "Invite to Project" button visible (for clients)
10. Click outside modal or X button
11. ✅ **Verify**: Modal closes

### Test from Contract Applications

1. Login as client
2. Open contract with applications
3. Click "View Applications"
4. Click freelancer's username (cyan link)
5. ✅ **Verify**: ProfileModal opens
6. ✅ **Verify**: Same data as marketplace profile

---

## 🎨 Visual Design Checklist

### Color Consistency

- ✅ Cyan/Blue: Primary actions, active states
- ✅ Green: Success, completed, applied
- ✅ Yellow: Warnings, pending reviews
- ✅ Purple: Assignments, special states
- ✅ Red: Errors, disputes
- ✅ Gray: Disabled, resolved

### Typography

- ✅ Headers: text-xl to text-3xl, font-bold
- ✅ Body: text-sm to text-base
- ✅ Captions: text-xs, text-gray-400

### Spacing

- ✅ Card padding: p-3 sm:p-4
- ✅ Section gaps: space-y-4 sm:space-y-6
- ✅ Grid gaps: gap-3 sm:gap-4

### Animations

- ✅ Hover transitions: transition-all duration-300
- ✅ Button hover: Shadow and brightness change
- ✅ Loading: Pulsing skeleton loaders

---

## 🐛 Common Issues & Solutions

### Issue 1: "Applied" button doesn't appear

**Cause**: `hasApplied` field not set correctly
**Solution**: Check API response includes `hasApplied: true`

### Issue 2: Applications list is empty

**Cause**: Contract.applications not populated
**Solution**: Ensure `.populate('applications.freelancer')` in backend

### Issue 3: Fund button appears too early

**Cause**: Status not "Assigned" yet
**Solution**: Verify assign API changed status to "Assigned"

### Issue 4: ProfileModal doesn't load

**Cause**: User ID not passed correctly
**Solution**: Check `app.freelancer._id` or `app.freelancer` (might be just ID)

### Issue 5: Buttons not responsive

**Cause**: Fixed width or missing breakpoints
**Solution**: Use `w-full sm:w-auto` pattern

---

## ✅ Complete Workflow Test

### End-to-End Happy Path (30 minutes)

1. **Setup (2 min)**
   - Start backend and frontend
   - Clear browser cache
   - Open two browser windows (client + freelancer)

2. **Client Posts Contract (3 min)**
   - Login as client
   - Create contract with all details
   - Verify status "Created"

3. **Freelancer Applies (3 min)**
   - Login as freelancer (other window)
   - Navigate to marketplace
   - Apply to contract
   - Verify button changes

4. **Client Reviews Application (5 min)**
   - Switch to client window
   - Open contract details
   - Click "View Applications"
   - View freelancer profile
   - Assign freelancer
   - Verify status "Assigned"

5. **Client Funds Escrow (3 min)**
   - Click "Fund Escrow"
   - Verify status "Funded"
   - Verify button changes to info box

6. **Freelancer Checks Status (2 min)**
   - Switch to freelancer window
   - Refresh marketplace
   - Verify contract shows "💰 Work in progress"

7. **Complete Workflow (Optional) (10 min)**
   - Freelancer submits work (if implemented)
   - Client approves work
   - Verify status "Paid"
   - Check payment released

8. **Final Verification (2 min)**
   - Check both user's contract lists
   - Verify stats updated (completed contracts, earnings)
   - Check no console errors

---

## 📊 Testing Checklist

### Backend Tests

- [ ] Apply validation works (status check)
- [ ] Duplicate application prevention works
- [ ] Assign validation works (client auth, application check)
- [ ] Fund validation works (status check, duplicate check)
- [ ] Approve validation works (status check, client auth)
- [ ] All API endpoints return proper errors

### Frontend Tests

- [ ] State-based buttons render correctly
- [ ] Loading states show during API calls
- [ ] Error alerts display properly
- [ ] Success confirmations appear
- [ ] ProfileModal opens and closes
- [ ] Applications list displays correctly
- [ ] All actions trigger correct APIs
- [ ] Page refreshes after state changes

### UX Tests

- [ ] All buttons have clear labels
- [ ] Hover effects work on desktop
- [ ] Touch targets are large enough on mobile
- [ ] Loading spinners visible during actions
- [ ] No layout shifts during loading
- [ ] Smooth transitions between states

### Security Tests

- [ ] Non-clients can't assign freelancers
- [ ] Non-freelancers can't apply
- [ ] Invalid state transitions blocked
- [ ] Unauthorized users get 403 errors
- [ ] JWT token required for all actions

---

## 🎉 Success Criteria

Your marketplace is working correctly if:

✅ Freelancers can browse and apply to "Created" contracts
✅ Duplicate applications are prevented
✅ Clients can view applications and assign freelancers
✅ Clients can fund "Assigned" contracts
✅ All state transitions are validated
✅ Buttons change based on contract status
✅ ProfileModal works for both roles
✅ Mobile responsive design works
✅ Loading states and errors display correctly
✅ No console errors during normal workflow

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend server logs
3. Verify MongoDB connection
4. Ensure User model has skills, bio, hourlyRate fields
5. Check JWT token is valid
6. Verify role middleware is working

Good luck with testing! 🚀
