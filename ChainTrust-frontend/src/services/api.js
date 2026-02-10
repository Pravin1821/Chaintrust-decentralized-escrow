import api from "../api/axios";

// Auth
export const authService = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
};

// Client Contracts
export const clientContractService = {
  createContract: (payload) => api.post("/contracts/createContract", payload),
  getContracts: () => api.get("/contracts/getContracts"),
  assignFreelancer: (id, payload) =>
    api.post(`/contracts/assignFreelancer/${id}`, payload),
  fundContract: (id, payload) =>
    api.post(`/contracts/fundContract/${id}`, payload),
  approveWork: (id) => api.post(`/contracts/approveWork/${id}`),
};

// Freelancer
export const freelancerService = {
  // Backend route is /freelancer/assignedContracts
  myContracts: () => api.get("/freelancer/assignedContracts"),
  getMarketplace: () => api.get("/contracts/marketpalce"), // Note: backend has typo "marketpalce"
  apply: (id, payload) => api.post(`/freelancer/apply/${id}`, payload),
  submitWork: (id, payload) => api.post(`/freelancer/submitWork`, payload),
};

// Disputes
export const disputeService = {
  raise: (payload) => api.post("/disputes/raiseDispute", payload),
  my: () => api.get("/disputes/my"),
  getById: (id) => api.get(`/disputes/${id}`),
};

// Profile
export async function updateProfile(payload) {
  const { data } = await api.patch("/auth/update", payload);
  return data;
}

export const profileService = {
  getUserProfile: (userId) => api.get(`/auth/user/${userId}`),
  getFreelancerList: () => api.get("/freelancer/list"),
  getUserStats: (userId) => api.get(`/contracts/user/${userId}/stats`),
};

// Admin Services
export const adminService = {
  // Users
  getAllUsers: () => api.get("/users"),
  updateUserStatus: (userId, payload) =>
    api.patch(`/users/${userId}/status`, payload),

  // Contracts
  getAllContracts: () => api.get("/contracts?admin=true"),
  getContractById: (id) => api.get(`/contracts/${id}`),

  // Disputes
  getAllDisputes: () => api.get("/disputes"),
  resolveDispute: (id, payload) => api.post(`/disputes/${id}/resolve`, payload),

  // Marketplace Moderation
  getMarketplaceContracts: () => api.get("/contracts?status=Created"),
  moderateContract: (id, payload) =>
    api.patch(`/contracts/${id}/moderate`, payload),

  // Dashboard Stats
  getDashboardStats: () =>
    Promise.all([
      api.get("/users"),
      api.get("/contracts?admin=true"),
      api.get("/disputes"),
    ]),
};
