export default function EscrowBadge({ status }) {
  const s = status || "NotFunded";
  const map = {
    NotFunded: {
      label: "Not Funded",
      className: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    },
    Funded: {
      label: "Funded",
      className:
        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    },
    Refunded: {
      label: "Released",
      className: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    },
  };
  const cfg = map[s] || map.NotFunded;
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
