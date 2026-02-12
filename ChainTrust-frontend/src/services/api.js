import api from "../api/axios";

// Auth
export const authService = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
};

// Client Contracts
export const clientContractService = {
  createContract: (payload) => api.post("/contracts", payload),
  getContracts: () => api.get("/contracts/getContracts"),
  assignFreelancer: (id, payload) =>
    api.post(`/contracts/assignFreelancer/${id}`, payload),
  fundContract: (id, payload) =>
    api.post(`/contracts/fundContract/${id}`, payload),
  approveWork: (id) => api.post(`/contracts/approveWork/${id}`),
  updateContract: (id, payload) =>
    api.patch(`/contracts/update/${id}`, payload),
  deleteContract: (id) => api.delete(`/contracts/delete/${id}`),
  respondRevision: (id, payload) =>
    api.post(`/contracts/${id}/respond-revision`, payload),
};

// Freelancer
export const freelancerService = {
  // Backend route is /freelancer/assignedContracts
  myContracts: () => api.get("/freelancer/assignedContracts"),
  getMarketplace: () => api.get("/contracts/marketpalce"), // Note: backend has typo "marketpalce"
  apply: (id, payload) => api.post(`/freelancer/apply/${id}`, payload),
  submitWork: (id, payload) => api.post(`/freelancer/submitWork`, payload),
  getInvitations: () => api.get("/contracts/invited"),
  respondInvite: (id, payload) =>
    api.post(`/contracts/${id}/respond-invite`, payload),
  requestRevision: (id, payload) =>
    api.post(`/contracts/${id}/request-revision`, payload),
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

// Notification Services
export const notificationService = {
  getNotifications: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread/count"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read/all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Reports
export const reportService = {
  create: (payload) => api.post("/reports", payload),
  list: (params) => api.get("/reports", { params }),
  updateStatus: (id, status) => api.patch(`/reports/${id}/status`, { status }),
  suspendUser: (id, userId) => api.post(`/reports/${id}/suspend`, { userId }),
};
