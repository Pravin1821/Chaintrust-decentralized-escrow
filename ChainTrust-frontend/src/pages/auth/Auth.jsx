import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "client",
  });

  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(loginForm);
      const role = normalizeRole(user.role);
      const dest = roleToDashboard(role);
      if (dest) navigate(dest);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Ensure role casing is normalized to match backend enums (Client/Freelancer/Admin)
      const normalizedPayload = {
        ...registerForm,
        role: (registerForm.role || "client").toLowerCase(),
      };

      const user = await register(normalizedPayload, { useAltApi: true });
      const role = normalizeRole(user.role);
      const dest = roleToDashboard(role);
      if (dest) navigate(dest);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    setError(null);
    setShowPassword(false);
  };

  const roleToDashboard = (role) => {
    if (role === "Client") return "/client/dashboard";
    if (role === "Freelancer") return "/freelancer/dashboard";
    if (role === "Admin") return "/admin/dashboard";
    return null;
  };

  function normalizeRole(role) {
    if (!role) return "Client";
    const r = String(role).toLowerCase();
    if (r === "freelancer") return "Freelancer";
    if (r === "admin") return "Admin";
    return "Client";
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden p-4 md:p-6">
      {/* Floating Emoji - hidden on mobile */}
      <div className="absolute top-10 right-1/4 text-3xl md:text-4xl animate-bounce opacity-20 z-0 hidden md:block">
        🚀
      </div>
      <div className="absolute bottom-10 left-1/4 text-3xl md:text-4xl animate-spin-slow opacity-15 z-0 hidden md:block">
        ⚡
      </div>
      <div className="absolute top-1/3 right-10 text-2xl md:text-3xl animate-pulse opacity-15 z-0 hidden md:block">
        💎
      </div>

      {/* Split Card Container */}
      <div
        className="relative z-10 w-full max-w-6xl mx-auto"
        style={{ perspective: "2000px" }}
      >
        <div
          className="relative transition-all duration-700 min-h-[600px] md:min-h-[640px]"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.7s",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* LOGIN SPLIT VIEW - FRONT */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden ${isFlipped ? "pointer-events-none" : ""}`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 h-full bg-gray-800/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl border border-cyan-400/20 overflow-hidden">
              {/* LEFT - Login Form */}
              <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                {/* Title */}
                <div className="mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300 tracking-tight mb-1">
                    ChainTrust
                  </h1>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-0.5">
                    Welcome Back! 👋
                  </h2>
                  <p className="text-gray-200 text-xs hidden md:block">
                    Login to your escrow platform
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-3">
                  {/* Email Input */}
                  <div className="group">
                    <label className="block text-white text-sm md:text-base font-bold mb-1.5 flex items-center">
                      <span className="mr-1.5 text-sm">📧</span>
                      <span className="hidden md:inline">Digital Identity</span>
                      <span className="md:hidden">Email</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      className="w-full px-3 py-2 md:py-2.5 bg-gray-800/70 border-2 border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all group-hover:border-cyan-300"
                      placeholder="yourawesome@email.com"
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Password Input */}
                  <div className="group">
                    <label className="block text-white text-sm md:text-base font-bold mb-1.5 flex items-center">
                      <span className="mr-1.5 text-sm">🔐</span>
                      <span className="hidden md:inline">Secret Key</span>
                      <span className="md:hidden">Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginForm.password}
                        className="w-full px-3 py-2 md:py-2.5 pr-10 bg-gray-800/70 border-2 border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all group-hover:border-cyan-300"
                        placeholder="••••••••••"
                        onChange={(e) =>
                          setLoginForm({
                            ...loginForm,
                            password: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform duration-200 focus:outline-none"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-900/20 border-2 border-red-500/40 rounded-lg p-2.5 flex items-center space-x-2 animate-shake">
                      <span className="text-lg">⚠️</span>
                      <p className="text-red-300 text-xs flex-1">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 md:py-3.5 rounded-lg text-sm transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>🚀</span>
                      <span>Launch Login</span>
                    </span>
                  </button>

                  {/* Forgot Password */}
                  <div className="text-center">
                    <a
                      href="#"
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                    >
                      Forgot your secret key?
                    </a>
                  </div>
                </form>

                {/* Register Link */}
                <div className="text-center pt-3 border-t border-gray-800 mt-3">
                  <p className="text-gray-400 text-xs mb-1">
                    New to ChainTrust? 🎉
                  </p>
                  <button
                    type="button"
                    onClick={flipCard}
                    className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors text-sm"
                  >
                    Create an Account →
                  </button>
                </div>
              </div>

              {/* RIGHT - Hero Section - Hidden on mobile */}
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-8 lg:p-10 flex-col justify-center items-center text-white relative overflow-hidden hidden md:flex blockchain-hero">
                {/* Blockchain network dots */}
                <span
                  className="node-dot"
                  style={{ top: "12%", left: "18%" }}
                ></span>
                <span
                  className="node-dot"
                  style={{ top: "38%", left: "72%" }}
                ></span>
                <span
                  className="node-dot"
                  style={{ top: "70%", left: "28%" }}
                ></span>
                <span
                  className="node-dot"
                  style={{ top: "82%", left: "66%" }}
                ></span>

                <div className="relative z-10 text-center">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                    Hello, Friend! 👋
                  </h2>
                  <p className="text-sm mb-4 text-cyan-100">
                    Enter your credentials and start your journey with us
                  </p>

                  {/* Features */}
                  <div className="space-y-2.5 text-left max-w-sm mx-auto">
                    <div className="flex items-start space-x-2.5 bg-cyan-900/20 backdrop-blur-sm rounded-lg p-2.5">
                      <span className="text-xl">🔒</span>
                      <div>
                        <h3 className="font-semibold text-xs">Secure Escrow</h3>
                        <p className="text-xs text-cyan-100">
                          Blockchain-powered trust
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5 bg-cyan-900/20 backdrop-blur-sm rounded-lg p-2.5">
                      <span className="text-xl">⚡</span>
                      <div>
                        <h3 className="font-semibold text-xs">
                          Instant Transactions
                        </h3>
                        <p className="text-xs text-cyan-100">
                          Lightning-fast payments
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5 bg-cyan-900/20 backdrop-blur-sm rounded-lg p-2.5">
                      <span className="text-xl">🌐</span>
                      <div>
                        <h3 className="font-semibold text-xs">Decentralized</h3>
                        <p className="text-xs text-cyan-100">
                          No middlemen, full control
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute top-4 right-4 bg-white text-teal-600 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg">
                  <span className="flex items-center space-x-1">
                    <span>🔒</span>
                    <span>SECURE</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* REGISTER SPLIT VIEW - BACK */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 ${!isFlipped ? "pointer-events-none" : ""}`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 h-full bg-gray-800/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl border border-cyan-400/20 overflow-hidden">
              {/* LEFT - Hero Section - Hidden on mobile */}
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-8 lg:p-10 flex-col justify-center items-center text-white relative overflow-hidden hidden md:flex blockchain-hero">
                {/* Blockchain network dots */}
                <span
                  className="node-dot"
                  style={{ top: "14%", left: "20%" }}
                ></span>
                <span
                  className="node-dot"
                  style={{ top: "40%", left: "68%" }}
                ></span>
                <span
                  className="node-dot"
                  style={{ top: "72%", left: "30%" }}
                ></span>
                <span
                  className="node-dot"
                  style={{ top: "84%", left: "64%" }}
                ></span>

                <div className="relative z-10 text-center">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                    Welcome! 🎉
                  </h2>
                  <p className="text-sm mb-4 text-cyan-100">
                    Join our decentralized community and unlock the future
                  </p>

                  {/* Features */}
                  <div className="space-y-2.5 text-left max-w-sm mx-auto">
                    <div className="flex items-start space-x-2.5 bg-cyan-900/20 backdrop-blur-sm rounded-lg p-2.5">
                      <span className="text-xl">✨</span>
                      <div>
                        <h3 className="font-semibold text-xs">
                          Smart Contracts
                        </h3>
                        <p className="text-xs text-cyan-100">
                          Automated & transparent
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5 bg-cyan-900/20 backdrop-blur-sm rounded-lg p-2.5">
                      <span className="text-xl">💎</span>
                      <div>
                        <h3 className="font-semibold text-xs">
                          Dispute Resolution
                        </h3>
                        <p className="text-xs text-cyan-100">
                          Fair & decentralized
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5 bg-cyan-900/20 backdrop-blur-sm rounded-lg p-2.5">
                      <span className="text-xl">🚀</span>
                      <div>
                        <h3 className="font-semibold text-xs">
                          Global Platform
                        </h3>
                        <p className="text-xs text-cyan-100">
                          Connect worldwide
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute top-4 right-4 bg-white text-cyan-600 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg">
                  <span className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span>NEW</span>
                  </span>
                </div>
              </div>

              {/* RIGHT - Register Form */}
              <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                {/* Title */}
                <div className="mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 tracking-tight mb-1">
                    ChainTrust
                  </h1>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-0.5">
                    Join the Future! 🚀
                  </h2>
                  <p className="text-gray-200 text-xs hidden md:block">
                    Create your account and start building trust
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-2.5">
                  {/* Username Input */}
                  <div className="group">
                    <label className="block text-white text-sm md:text-base font-bold mb-1.5 flex items-center">
                      <span className="mr-1.5 text-sm">👤</span>
                      <span className="hidden md:inline">Username</span>
                      <span className="md:hidden">Username</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registerForm.username}
                      className="w-full px-3 py-2 md:py-2.5 bg-gray-800/70 border-2 border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all group-hover:border-cyan-300"
                      placeholder="Choose a username"
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Email Input */}
                  <div className="group">
                    <label className="block text-white text-sm md:text-base font-bold mb-1.5 flex items-center">
                      <span className="mr-1.5 text-sm">📧</span>
                      <span className="hidden md:inline">Digital Identity</span>
                      <span className="md:hidden">Email</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      className="w-full px-3 py-2 md:py-2.5 bg-gray-800/70 border-2 border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all group-hover:border-cyan-300"
                      placeholder="yourawesome@email.com"
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Password Input */}
                  <div className="group">
                    <label className="block text-white text-sm md:text-base font-bold mb-1.5 flex items-center">
                      <span className="mr-1.5 text-sm">🔐</span>
                      <span className="hidden md:inline">Secret Key</span>
                      <span className="md:hidden">Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={registerForm.password}
                        className="w-full px-3 py-2 md:py-2.5 pr-10 bg-gray-800/70 border-2 border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all group-hover:border-cyan-300"
                        placeholder="Make it super secure!"
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            password: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform duration-200 focus:outline-none"
                      >
                        {showPassword ? "🙊" : "👀"}
                      </button>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="group">
                    <label className="block text-white text-sm md:text-base font-bold mb-1.5 flex items-center">
                      <span className="mr-1.5 text-sm">🎭</span>
                      <span className="hidden md:inline">Your Mission</span>
                      <span className="md:hidden">Role</span>
                    </label>
                    <select
                      value={registerForm.role}
                      className="w-full px-3 py-2 md:py-2.5 bg-gray-800/70 border-2 border-gray-700 rounded-lg text-sm text-gray-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all group-hover:border-cyan-300"
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          role: e.target.value,
                        })
                      }
                    >
                      <option value="client">
                        💼 Client - I hire awesome people
                      </option>
                      <option value="freelancer">
                        🚀 Freelancer - I build cool stuff
                      </option>
                      <option value="admin">
                        👑 Admin - I rule this place
                      </option>
                    </select>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-900/20 border-2 border-red-500/40 rounded-lg p-2.5 flex items-center space-x-2 animate-shake">
                      <span className="text-lg">⚠️</span>
                      <p className="text-red-300 text-xs flex-1">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 md:py-3.5 rounded-lg text-sm transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>✨</span>
                      <span>Create Account</span>
                    </span>
                  </button>
                </form>

                {/* Login Link */}
                <div className="text-center pt-3 border-t border-gray-800 mt-3">
                  <p className="text-gray-200 text-xs mb-1">
                    Already have an account? 😊
                  </p>
                  <button
                    type="button"
                    onClick={flipCard}
                    className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors text-sm"
                  >
                    ← Back to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
