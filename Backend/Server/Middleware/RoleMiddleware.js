// Perform case-insensitive role checks to avoid issues when roles are stored in different casing (e.g., "client" vs "Client")
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = (req.user?.role || "").toLowerCase();
    const allowed = allowedRoles.some(
      (role) => role.toLowerCase() === userRole,
    );

    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have the required role" });
    }
    next();
  };
};
