export default function LoadingSkeleton({ count = 1, type = "card" }) {
  const skeletons = Array.from({ length: count });

  if (type === "card") {
    return (
      <>
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-4 animate-pulse"
          >
            <div className="space-y-3">
              {/* Title and Amount */}
              <div className="flex justify-between items-start gap-3">
                <div className="h-6 bg-gray-700/50 rounded w-2/3"></div>
                <div className="h-8 bg-cyan-500/10 rounded w-20"></div>
              </div>

              {/* User info */}
              <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-700/50 rounded w-full"></div>
                <div className="h-4 bg-gray-700/50 rounded w-4/5"></div>
              </div>

              {/* Meta info */}
              <div className="flex gap-3 pt-2 border-t border-gray-700/50">
                <div className="h-4 bg-gray-700/50 rounded w-20"></div>
                <div className="h-4 bg-gray-700/50 rounded w-24"></div>
              </div>

              {/* Button */}
              <div className="h-10 bg-gray-700/30 rounded"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === "profile") {
    return (
      <div className="space-y-4 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-700/50 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-700/50 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-700/30 rounded-lg"></div>
          ))}
        </div>

        {/* Contract history */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-700/30 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Default list skeleton
  return (
    <>
      {skeletons.map((_, i) => (
        <div
          key={i}
          className="h-12 bg-gray-700/30 rounded-lg animate-pulse"
        ></div>
      ))}
    </>
  );
}
