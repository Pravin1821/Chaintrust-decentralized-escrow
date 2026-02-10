# Admin Dashboard - ChainTrust Platform

A comprehensive admin control panel for managing the decentralized freelancing & escrow platform.

## Features

### 1. Dashboard Overview

- **Total Users**: View count of clients and freelancers
- **Active Contracts**: Monitor contracts currently in progress
- **Escrow Funded**: Track total funds locked in escrow
- **Open Disputes**: See disputes requiring immediate attention
- **Recent Activity**: Monitor the latest 5 contract updates
- **Trend Indicators**: View growth metrics for key statistics

### 2. Dispute Management (Critical)

**Access**: `/admin/disputes`

The most critical admin function - allows resolution of disputes between clients and freelancers.

#### Features:

- View all open disputes with full context
- See contract details, parties involved, and escrow amounts
- Review dispute reasons and submitted work
- Resolve disputes in favor of either party
- Confirmation modals with irreversible action warnings
- Real-time UI updates with automatic refetch

#### Resolution Options:

- **Favor Freelancer**: Releases escrow funds to freelancer
- **Favor Client**: Refunds escrow to client

#### Safety Features:

- Only disputes with status "Disputed" can be resolved
- Confirmation modal required before resolution
- Warning about irreversible actions
- Optimistic UI updates for better UX

### 3. Contract Monitoring

**Access**: `/admin/contracts`

Monitor all platform contracts with filtering and search capabilities.

#### Features:

- View all contracts across the platform
- Search by title, client, or freelancer
- Filter by status (Created, Funded, Submitted, etc.)
- Identify stuck contracts (Funded > 14 days)
- View detailed contract information (read-only)
- Age tracking for each contract

#### Alerts:

- Orange warnings for contracts stuck > 14 days
- Visual indicators for disputed contracts
- Critical contract highlighting

### 4. User Management

**Access**: `/admin/users`

Manage platform users and their account status.

#### Features:

- View all users (Clients, Freelancers, Admins)
- Search by username or email
- Filter by role and status
- Suspend or reactivate user accounts
- View user join dates and roles

#### User Actions:

- **Suspend User**: Disable user account access
- **Reactivate User**: Restore suspended accounts
- View user activity and stats

#### Safety Features:

- Cannot suspend own admin account
- Confirmation required for status changes
- Cannot delete users (only suspend)

### 5. Marketplace Moderation

**Access**: `/admin/marketplace`

Moderate marketplace listings to prevent spam and fraud.

#### Features:

- View all marketplace listings (Created status)
- Flag suspicious contracts
- Hide spam/fraudulent listings
- Restore previously moderated contracts
- Search and filter capabilities

#### Moderation Actions:

- **Flag**: Mark contract as suspicious (visible warning)
- **Hide**: Remove contract from marketplace
- **Restore**: Undo flag/hide actions

#### Limitations:

- Admin cannot edit contract content
- Admin can only moderate visibility
- Actions are logged for audit trail

## Access Control

### Authentication

- Only users with `role === "Admin"` can access admin routes
- Protected by `ProtectedRoute` component with role checking
- Unauthorized users redirected to login or appropriate dashboard

### Backend Security

- All admin routes protected by `authorizeRoles("Admin")` middleware
- JWT token verification required
- Rate limiting applied to all admin endpoints

## Technical Stack

### Frontend

- **React** + **Vite** for fast development
- **Tailwind CSS** for styling with glassmorphism effects
- **React Router** for routing
- **Axios** for API calls
- **Context API** for auth and RBAC

### Backend

- **Node.js** + **Express** for API server
- **MongoDB** + **Mongoose** for database
- **JWT** for authentication
- **Helmet** for security headers
- **Rate Limiting** for API protection

## API Endpoints

### Admin Routes

```
GET    /api/users                      - Get all users
PATCH  /api/users/:id/status          - Update user status

GET    /api/contracts?admin=true      - Get all contracts
PATCH  /api/contracts/:id/moderate    - Moderate contract

GET    /api/disputes                  - Get all disputes
POST   /api/disputes/:id/resolve      - Resolve dispute
```

## Database Schema Updates

### User Model

- Added `isActive` field for user suspension

### Contract Model

- Added `isFlagged` field for suspicious contracts
- Added `isHidden` field for hidden contracts

### Dispute Model

- Uses `status: "Open" | "Resolved"`
- Transformed to `"Disputed" | "Resolved"` for frontend

## Security Best Practices

1. **Never trust frontend**: All state changes validated on backend
2. **Role verification**: Every admin route checks user role
3. **Audit logging**: All admin actions should be logged (future enhancement)
4. **Confirmation modals**: Required for destructive actions
5. **Self-protection**: Admins cannot modify their own status
6. **Rate limiting**: Applied to all API endpoints

## UI/UX Features

- **Dark Mode**: Professional enterprise SaaS look
- **Glassmorphism**: Modern panel designs with backdrop blur
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Toast notifications and error boundaries
- **Responsive**: Mobile-friendly with collapsible sidebar
- **Icons**: Lucide icons (react-icons/lu) for consistency
- **Color Coding**:
  - Red/Orange for critical items (disputes, warnings)
  - Green for success states
  - Purple for primary actions
  - Gray for neutral states

## Navigation

### Sidebar Menu

1. **Dashboard** - Overview and metrics
2. **Disputes** - Critical badge indicator
3. **Contracts** - Monitor all contracts
4. **Users** - User management
5. **Marketplace** - Content moderation

### Mobile Support

- Hamburger menu for mobile devices
- Slide-out sidebar with overlay
- Touch-friendly controls

## Future Enhancements

1. **Audit Log**: Track all admin actions with timestamps
2. **Analytics Dashboard**: Advanced metrics and charts
3. **Bulk Actions**: Suspend multiple users at once
4. **Export Data**: CSV/PDF exports for reports
5. **Email Notifications**: Alert admins of critical issues
6. **Advanced Filters**: Date ranges, custom queries
7. **Role Management**: Create custom admin roles
8. **Activity Timeline**: Detailed user activity logs

## Development

### Running Locally

Backend:

```bash
cd Backend/Server
npm install
npm start
```

Frontend:

```bash
cd ChainTrust-frontend
npm install
npm run dev
```

### Creating Admin User

To create an admin user, directly update the database:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "Admin" } });
```

Or register normally and update via MongoDB Compass/CLI.

## Troubleshooting

### Common Issues

1. **403 Forbidden**: User doesn't have Admin role
2. **401 Unauthorized**: Token expired or invalid
3. **Cannot access routes**: Check role capitalization (should be "Admin")
4. **Disputes not loading**: Check populate paths in backend

### Debug Tips

- Check browser console for errors
- Verify JWT token in localStorage
- Check network tab for API responses
- Ensure backend is running on correct port

## License

Part of the ChainTrust - Decentralized Escrow Platform
