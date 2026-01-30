import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      if (user.role === "client") {
        navigate("/client/dashboard");
      }
      if (user.role === "freelancer") {
        navigate("/freelancer/dashboard");
      }
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Floating Emoji */}
        <div className="absolute top-10 right-1/4 text-6xl animate-bounce opacity-30">
          🚀
        </div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-spin-slow opacity-20">
          ⚡
        </div>
        <div className="absolute top-1/2 right-10 text-4xl animate-pulse opacity-25">
          🎯
        </div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div
          className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Glitch Effect Title */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 mb-2 tracking-tight">
                ChainTrust
              </h1>
              {isHovered && (
                <div
                  className="absolute inset-0 text-5xl font-black text-cyan-400 opacity-50 animate-pulse"
                  style={{ transform: "translate(2px, 2px)" }}
                >
                  ChainTrust
                </div>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
              <span className="animate-pulse">⚡</span>
              <p>Decentralized Escrow Platform</p>
              <span className="animate-pulse">⚡</span>
            </div>
            <div className="mt-2 flex justify-center space-x-2">
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                Web3
              </span>
              <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full border border-pink-500/30">
                Blockchain
              </span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30">
                Secure
              </span>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            {/* Email Input */}
            <div className="group">
              <label className="block text-purple-300 text-sm font-semibold mb-2 flex items-center">
                <span className="mr-2">📧</span>
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                className="w-full px-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all group-hover:border-purple-400/50"
                placeholder="yourawesome@email.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Password Input with Crazy Toggle */}
            <div className="group">
              <label className="block text-purple-300 text-sm font-semibold mb-2 flex items-center">
                <span className="mr-2">🔐</span>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  className="w-full px-4 py-3 pr-12 bg-gray-800/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all group-hover:border-purple-400/50"
                  placeholder="••••••••••"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl hover:scale-125 transition-transform duration-200 focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-3 flex items-center space-x-2 animate-shake">
                <span className="text-xl">⚠️</span>
                <p className="text-red-300 text-sm flex-1">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 hover:from-purple-500 hover:via-pink-500 hover:to-yellow-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>LAUNCH LOGIN</span>
                <span>🚀</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <a
                href="#"
                className="text-sm text-purple-300 hover:text-purple-200 transition-colors inline-flex items-center space-x-1"
              >
                <span>🤔</span>
                <span>Forgot your secret password?</span>
              </a>
            </div>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-gray-700/50">
              <p className="text-gray-400 text-sm mb-2">
                New to the blockchain gang?
              </p>
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
              >
                <span>✨</span>
                <span>Join the Revolution</span>
                <span>✨</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Floating Badge */}
        <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-2 rounded-full font-bold text-sm transform rotate-12 shadow-lg animate-bounce">
          <span className="flex items-center space-x-1">
            <span>⭐</span>
            <span>SECURE AF</span>
          </span>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="absolute bottom-4 text-center text-gray-500 text-xs">
        <p className="flex items-center justify-center space-x-2">
          <span>Made with</span>
          <span className="text-red-500 animate-pulse">❤️</span>
          <span>by crazy developers</span>
          <span className="animate-spin-slow">🌀</span>
        </p>
      </div>
    </div>
  );
}
