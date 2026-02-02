import { Route, Routes, Navigate } from "react-router-dom";
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
import FreelancerProfile from "./pages/freelancer/Profile.jsx";
import FreelancerDashboard from "./pages/freelancer/Dashboard.jsx";
import FreelancerLayout from "./layouts/FreelancerLayout.jsx";
import FreelancerMyContracts from "./pages/freelancer/MyContracts.jsx";
import FreelancerContractDetails from "./pages/freelancer/ContractDetails.jsx";
import FreelancerEarnings from "./pages/freelancer/Earnings.jsx";
import FreelancerMarketplace from "./pages/freelancer/Marketplace.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />

      {/* Protected role-based routes */}
      <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
        <Route element={<ClientLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/client/dashboard" element={<Dashboard />} />
          <Route path="/client/create" element={<CreateContract />} />
          <Route path="/client/contracts" element={<MyContracts />} />
          <Route path="/client/contracts/:id" element={<ContractDetails />} />
          <Route path="/client/wallet" element={<Wallet />} />
          <Route path="/client/disputes" element={<Disputes />} />
          <Route path="/client/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["freelancer"]} />}>
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
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
