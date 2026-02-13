import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Auth from "./pages/auth/Auth.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import ClientLayout from "./layouts/ClientLayout.jsx";
import Dashboard from "./pages/client/Dashboard.jsx";
import CreateContract from "./pages/client/CreateContract.jsx";
import MyContracts from "./pages/client/MyContracts.jsx";
import ContractDetails from "./pages/client/ContractDetails.jsx";
import Wallet from "./pages/client/Wallet.jsx";
import Disputes from "./pages/client/Disputes.jsx";
import Profile from "./pages/client/Profile.jsx";
import ClientMarketplace from "./pages/client/Marketplace.jsx";
import FreelancerProfile from "./pages/freelancer/Profile.jsx";
import FreelancerDashboard from "./pages/freelancer/Dashboard.jsx";
import FreelancerLayout from "./layouts/FreelancerLayout.jsx";
import FreelancerMyContracts from "./pages/freelancer/MyContracts.jsx";
import FreelancerContractDetails from "./pages/freelancer/ContractDetails.jsx";
import FreelancerEarnings from "./pages/freelancer/Earnings.jsx";
import FreelancerMarketplace from "./pages/freelancer/Marketplace.jsx";
import FreelancerInvitations from "./pages/freelancer/Invitations.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminDisputes from "./pages/admin/AdminDisputes.jsx";
import AdminContracts from "./pages/admin/AdminContracts.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminMarketplace from "./pages/admin/AdminMarketplace.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import Landing from "./pages/Landing.jsx";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role
  const dashboardPath = `/${user.role.toLowerCase()}/dashboard`;
  return <Navigate to={dashboardPath} replace />;
}

function App() {
  return (
    <Routes>
      {/* Public landing */}
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<RootRedirect />} />

      {/* Public */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />

      {/* Protected role-based routes */}
      <Route element={<ProtectedRoute allowedRoles={["Client"]} />}>
        <Route element={<ClientLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/client/dashboard" element={<Dashboard />} />
          <Route path="/client/create" element={<CreateContract />} />
          <Route path="/client/contracts" element={<MyContracts />} />
          <Route path="/client/contracts/:id" element={<ContractDetails />} />
          <Route path="/client/wallet" element={<Wallet />} />
          <Route path="/client/disputes" element={<Disputes />} />
          <Route path="/client/profile" element={<Profile />} />
          <Route path="/client/marketplace" element={<ClientMarketplace />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["Freelancer"]} />}>
        <Route element={<FreelancerLayout />}>
          <Route
            path="/freelancer/dashboard"
            element={<FreelancerDashboard />}
          />
          <Route
            path="/freelancer/marketplace"
            element={<FreelancerMarketplace />}
          />
          <Route
            path="/freelancer/invitations"
            element={<FreelancerInvitations />}
          />
          <Route
            path="/freelancer/contracts"
            element={<FreelancerMyContracts />}
          />
          <Route
            path="/freelancer/contracts/:id"
            element={<FreelancerContractDetails />}
          />
          <Route path="/freelancer/earnings" element={<FreelancerEarnings />} />
          <Route path="/freelancer/profile" element={<FreelancerProfile />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/admin/contracts" element={<AdminContracts />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/marketplace" element={<AdminMarketplace />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
