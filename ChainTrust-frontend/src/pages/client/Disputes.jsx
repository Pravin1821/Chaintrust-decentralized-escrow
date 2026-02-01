import { useEffect, useState } from "react";
// Layout is provided by routes; do not wrap here
import Loader from "../../components/Loader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { disputeService } from "../../services/api.js";

export default function Disputes() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await disputeService.my();
        const list = Array.isArray(data) ? data : data?.disputes || [];
        setItems(list);
      } catch (e) {
        const status = e?.response?.status;
        const msg =
          e?.response?.data?.message || e?.message || "Failed to load disputes";
        setErrorStatus(status || null);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Disputes</h1>
      {loading && <Loader label="Loading disputes..." />}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-3 rounded-lg">
          <div className="font-semibold">{error}</div>
          {errorStatus === 401 && (
            <p className="mt-1 text-sm text-red-200/90">
              You are not logged in. Please sign in to view your disputes.
            </p>
          )}
          {errorStatus === 403 && (
            <p className="mt-1 text-sm text-red-200/90">
              Your role is not permitted for this view. Disputes are available
              to clients and freelancers.
            </p>
          )}
        </div>
      )}
      {!loading &&
        !error &&
        (items.length === 0 ? (
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/60 text-sm text-gray-300">
            No disputes yet. You can raise a dispute from a funded or submitted
            contract if needed.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((d) => {
              const created = d.createdAt
                ? new Date(d.createdAt).toLocaleString()
                : "";
              const contractLabel =
                typeof d.contract === "object" && d.contract !== null
                  ? d.contract.title || d.contract._id
                  : d.contract;
              const evidence = Array.isArray(d.evidence) ? d.evidence : [];
              return (
                <div
                  key={d._id}
                  className="bg-gray-900/70 border border-cyan-400/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold truncate mr-3">
                      {d.reason}
                    </div>
                    <StatusBadge status={d.status || "Disputed"} />
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="text-gray-300">
                      <span className="text-gray-400">Contract:</span>{" "}
                      {contractLabel || "—"}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-400">Raised By:</span>{" "}
                      {d.raisedBy || "—"}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-400">Created:</span> {created}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-300">
                    <span className="text-gray-400">Evidence:</span>{" "}
                    {evidence.length ? evidence.join(", ") : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}
