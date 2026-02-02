const user = require("../Model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      walletAddress,
      permissions,
      department,
    } = req.body;
    let { name } = req.body;
    if (!username && name) {
      username = name;
    }
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      username,
      email,
      password: hashedPassword,
      role: role || "client",
      walletAddress,
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
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      walletAddress: newUser.walletAddress,
      isWalletVerified: newUser.isWalletVerified,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      reputation: newUser.reputation,
      token,
    });
  } catch (error) {
    console.error("[AuthController] Register error:", error);
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
    res.status(200).json({
      _id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      role: existingUser.role,
      walletAddress: existingUser.walletAddress,
      isWalletVerified: existingUser.isWalletVerified,
      isActive: existingUser.isActive,
      createdAt: existingUser.createdAt,
      reputation: existingUser.reputation,
      token,
    });
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
    if (req.body.password) {
      payload.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user
      .findByIdAndUpdate(req.user._id, payload, {
        new: true,
        runValidators: true,
      })
      .select("-password");
    res.status(200).json(updatedUser);
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
    res.status(200).json(currentUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    console.error("[AuthController] Me error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
