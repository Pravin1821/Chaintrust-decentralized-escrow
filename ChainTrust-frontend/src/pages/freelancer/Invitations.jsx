import { useEffect, useState } from "react";
import { freelancerService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";

export default function Invitations() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineId, setShowDeclineId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const { data } = await freelancerService.getInvitations();
      setInvites(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load invitations");
      setToast({ type: "error", text: "Failed to refresh invitations" });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      setActioningId(id);
      await freelancerService.respondInvite(id, { action: "accept" });
      await fetchInvites();
      navigate(`/freelancer/contracts/${id}`);
      setToast({ type: "success", text: "Invitation accepted" });
    } catch (err) {
      setToast({
        type: "error",
        text: err.response?.data?.message || "Failed to accept invite",
      });
    } finally {
      setActioningId(null);
    }
  };

  const handleDecline = async (id) => {
    if (!declineReason.trim()) {
      setToast({ type: "error", text: "Please provide a reason to decline" });
      return;
    }
    try {
      setActioningId(id);
      await freelancerService.respondInvite(id, {
        action: "decline",
        reason: declineReason.trim(),
      });
      setDeclineReason("");
      setShowDeclineId(null);
      await fetchInvites();
      setToast({ type: "success", text: "Invitation declined" });
    } catch (err) {
      setToast({
        type: "error",
        text: err.response?.data?.message || "Failed to decline invite",
      });
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (invites.length === 0) {
    return (
      <div className="p-6 bg-gray-900/60 rounded-xl border border-gray-800/60 text-center space-y-2">
        <div className="text-3xl">📭</div>
        <div className="text-lg font-semibold">No invitations</div>
        <p className="text-sm text-gray-400">
          You have no pending invites right now. Check the marketplace for
          public contracts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`p-3 rounded-lg border text-sm ${toast.type === "success" ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-200" : "bg-red-600/20 border-red-500/30 text-red-200"}`}
        >
          {toast.text}
        </div>
      )}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Invitations</h1>
          <p className="text-sm text-gray-400">
            Accept or decline private invitations. Declined invites return to
            the public marketplace.
          </p>
        </div>
        <button
          onClick={fetchInvites}
          className="px-4 py-2 text-sm rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30"
        >
          Refresh
        </button>
      </header>

      {error && (
        <div className="p-3 rounded-lg bg-red-600/20 text-red-200 border border-red-600/30 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {invites.map((invite) => (
          <div
            key={invite._id}
            className="p-4 rounded-xl bg-gray-900/70 border border-gray-800/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {invite.title}
                </h2>
                <p className="text-sm text-gray-300 mt-1">
                  {invite.description?.slice(0, 160)}
                </p>
                <div className="text-xs text-gray-400 mt-2">
                  Budget: {invite.amount} • Deadline:{" "}
                  {invite.deadline?.slice(0, 10)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Client: {invite.client?.username || invite.client?.email}
                </div>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-600/20 text-yellow-300 border border-yellow-500/40">
                Invited
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleAccept(invite._id)}
                disabled={actioningId === invite._id}
                className="px-4 py-2 rounded-lg bg-green-600/80 hover:bg-green-500 text-white text-sm disabled:opacity-60"
              >
                {actioningId === invite._id ? "Accepting..." : "Accept"}
              </button>
              <button
                onClick={() => {
                  setShowDeclineId(invite._id);
                  setDeclineReason("");
                }}
                disabled={actioningId === invite._id}
                className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-sm disabled:opacity-60"
              >
                Decline
              </button>
            </div>

            {showDeclineId === invite._id && (
              <div className="mt-3 space-y-2">
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Why are you declining?"
                  className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700/60 rounded-lg text-sm text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecline(invite._id)}
                    disabled={actioningId === invite._id}
                    className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-sm disabled:opacity-60"
                  >
                    {actioningId === invite._id
                      ? "Declining..."
                      : "Submit Decline"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeclineId(null);
                      setDeclineReason("");
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
