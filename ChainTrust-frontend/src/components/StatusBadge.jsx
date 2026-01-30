export default function StatusBadge({ status }) {
  const map = {
    Created: { color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: "📝" },
    Assigned: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: "📌" },
    Funded: { color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", icon: "💰" },
    Submitted: { color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: "📦" },
    Paid: { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: "✅" },
    Disputed: { color: "bg-red-500/20 text-red-300 border-red-500/30", icon: "⚠️" },
  };
  const s = map[status] || map.Created;
  return (
    <span className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full border ${s.color}`}>
      <span>{s.icon}</span>
      <span>{status}</span>
    </span>
  );
}


