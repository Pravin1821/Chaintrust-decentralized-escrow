import { useState } from "react";
import {
  LuStar,
  LuEye,
  LuMail,
  LuCalendar,
  LuCircleCheck,
  LuBadgeCheck,
} from "react-icons/lu";

export default function FreelancerCard({
  freelancer,
  onViewProfile,
  onInvite,
}) {
  const [showFullBio, setShowFullBio] = useState(false);

  // Calculate stats
  const stats = {
    completed: freelancer.completedContracts || 0,
    earnings: freelancer.totalEarnings || 0,
    disputes: freelancer.disputes || 0,
    rating: freelancer.reputation || 0,
  };

  // Bio/description
  const bio =
    freelancer.bio ||
    `Experienced ${freelancer.role || "freelancer"} ready to take on new projects.`;

  return (
    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 hover:border-purple-500/40 transition-all duration-300 overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Header with Avatar and Name */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {freelancer.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <button
              onClick={() => onViewProfile(freelancer)}
              className="text-lg font-bold text-white hover:text-cyan-400 transition-colors text-left line-clamp-1"
            >
              {freelancer.username}
            </button>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <LuBadgeCheck size={12} />
                FREELANCER
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <LuStar size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-gray-300 font-semibold">
                {stats.rating.toFixed(1)}
              </span>
              <span className="text-gray-500 text-xs">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Bio/Description */}
        <div>
          <p
            className={`text-sm text-gray-300 ${showFullBio ? "" : "line-clamp-2"}`}
          >
            {bio}
          </p>
          {bio.length > 100 && (
            <button
              onClick={() => setShowFullBio(!showFullBio)}
              className="text-xs text-cyan-400 hover:text-cyan-300 mt-1"
            >
              {showFullBio ? "Show less ▲" : "Show more ▼"}
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-600/10 rounded-lg p-2 border border-green-500/20 text-center">
            <div className="text-lg font-bold text-green-400">
              {stats.completed}
            </div>
            <div className="text-[10px] text-gray-400">Completed</div>
          </div>
          <div className="bg-cyan-600/10 rounded-lg p-2 border border-cyan-500/20 text-center">
            <div className="text-lg font-bold text-cyan-400">
              ${stats.earnings.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400">Earned</div>
          </div>
          <div className="bg-red-600/10 rounded-lg p-2 border border-red-500/20 text-center">
            <div className="text-lg font-bold text-red-400">
              {stats.disputes}
            </div>
            <div className="text-[10px] text-gray-400">Disputes</div>
          </div>
        </div>

        {/* Skills/Tags */}
        {freelancer.skills && freelancer.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {freelancer.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-md border border-gray-600/50"
              >
                {skill}
              </span>
            ))}
            {freelancer.skills.length > 4 && (
              <span className="px-2 py-1 text-gray-400 text-xs">
                +{freelancer.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-700/50">
          <button
            onClick={() => onViewProfile(freelancer)}
            className="flex-1 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 text-sm font-medium flex items-center justify-center gap-1.5"
          >
            <LuEye size={16} />
            View Profile
          </button>
          <button
            onClick={() => onInvite(freelancer)}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 text-sm shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center gap-1.5"
          >
            <LuMail size={16} />
            Invite
          </button>
        </div>

        {/* Additional Info */}
        <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-700/30">
          <span className="flex items-center gap-1">
            <LuCalendar size={12} />
            Joined {new Date(freelancer.createdAt).toLocaleDateString()}
          </span>
          {freelancer.isWalletVerified && (
            <span className="text-green-400 flex items-center gap-1">
              <LuCircleCheck size={12} />
              Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
