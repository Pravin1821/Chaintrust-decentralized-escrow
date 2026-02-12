const user = require("../Model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { calculateLevel } = require("../utils/reputation");

const serializeUser = (userDoc, options = {}) => {
  if (!userDoc) return null;
  const plain = userDoc.toObject ? userDoc.toObject() : userDoc;
  const score = Number(plain.reputation?.score ?? plain.reputation ?? 0) || 0;
  const level = plain.reputation?.level || calculateLevel(score);

  const base = {
    _id: plain._id,
    username: plain.username,
    email: plain.email,
    role: plain.role,
    walletAddress: plain.walletAddress,
    isWalletVerified: plain.isWalletVerified,
    isActive: plain.isActive,
    createdAt: plain.createdAt,
    reputation: { score, level },
    reputationScore: score,
    reputationLevel: level,
    phone: plain.phone,
    phoneNumber: plain.phoneNumber,
    isPhoneVerified: plain.isPhoneVerified,
    reportsCount: plain.reportsCount,
    isSuspended: plain.isSuspended,
    skills: plain.skills || [],
    bio: plain.bio || "",
    hourlyRate: plain.hourlyRate ?? 0,
    permissions: plain.permissions,
    department: plain.department,
  };

  if (options.includeToken && options.token) {
    base.token = options.token;
  }

  return base;
};
exports.register = async (req, res) => {
  try {
    let {
      username,
      email,
      password,
      role,
      walletAddress,
      permissions,
      department,
      name,
      phone,
      phoneNumber,
    } = req.body;

    if (!username && name) {
      username = name;
    }

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }
    const normalizeRole = (r) => {
      const val = String(r || "").toLowerCase();
      if (val.includes("admin")) return "Admin";
      if (val.includes("free")) return "Freelancer";
      return "Client";
    };
    const normalizedRole = normalizeRole(role);
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      username,
      email,
      password: hashedPassword,
      role: normalizedRole,
      walletAddress,
      phone: phone ? String(phone).trim() : null,
      phoneNumber: phoneNumber
        ? String(phoneNumber).trim()
        : phone
          ? String(phone).trim()
          : null,
    });
    if (role === "admin") {
      newUser.permissions = permissions || [];
      newUser.department = department || null;
    } else {
      newUser.walletAddress = walletAddress || null;
    }
    await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(201).json(serializeUser(newUser, { includeToken: true, token }));
  } catch (error) {
    console.error("[AuthController] Register error:", error);
    if (error && error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (error?.errors) {
      const first = Object.values(error.errors)[0];
      return res
        .status(400)
        .json({ message: first?.message || "Invalid input" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await user.findOne({ email }).select("+password");
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: existingUser._id, role: existingUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res
      .status(200)
      .json(serializeUser(existingUser, { includeToken: true, token }));
  } catch (error) {
    console.error("[AuthController] Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.update = async (req, res) => {
  try {
    const payload = {};
    if (typeof req.body.username === "string")
      payload.username = req.body.username.trim();
    if (typeof req.body.email === "string")
      payload.email = req.body.email.trim();
    if (typeof req.body.walletAddress === "string")
      payload.walletAddress = req.body.walletAddress.trim();
    if (typeof req.body.phone === "string")
      payload.phone = req.body.phone.trim();
    if (typeof req.body.phoneNumber === "string")
      payload.phoneNumber = req.body.phoneNumber.trim();
    if (typeof req.body.bio === "string") payload.bio = req.body.bio.trim();
    if (req.body.hourlyRate !== undefined) {
      const parsedRate = Number(req.body.hourlyRate);
      if (!Number.isNaN(parsedRate)) payload.hourlyRate = parsedRate;
    }
    if (Array.isArray(req.body.skills)) {
      payload.skills = req.body.skills
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean);
    } else if (typeof req.body.skills === "string") {
      payload.skills = req.body.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (req.body.password) {
      payload.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user
      .findByIdAndUpdate(req.user._id, payload, {
        new: true,
        runValidators: true,
      })
      .select("-password");
    res.status(200).json(serializeUser(updatedUser));
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error("[AuthController] Update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const currentUser = await user.findById(req.user._id).select("-password");
    res.status(200).json(serializeUser(currentUser));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.status(200).json(serializeUser(req.user));
  } catch (error) {
    console.error("[AuthController] Me error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const targetUser = await user.findById(userId).select("-password");
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const requesterId = req.user?._id?.toString();
    const isSelf = requesterId && requesterId === targetUser._id.toString();

    let canViewPhone = false;
    if (!isSelf && requesterId) {
      const Contract = require("../Model/Contract");
      const relation = await Contract.findOne({
        isDeleted: { $ne: true },
        $or: [
          { client: requesterId, freelancer: targetUser._id },
          { client: targetUser._id, freelancer: requesterId },
        ],
      }).select("_id status");
      if (relation) {
        canViewPhone = true;
      }
    }

    const sanitized = serializeUser(targetUser);
    if (!canViewPhone && !isSelf) {
      delete sanitized.phone;
      delete sanitized.phoneNumber;
      delete sanitized.isPhoneVerified;
    }

    res.status(200).json(sanitized);
  } catch (error) {
    console.error("[AuthController] GetUserById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
