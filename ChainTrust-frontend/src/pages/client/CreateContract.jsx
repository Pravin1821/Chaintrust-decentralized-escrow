import { useEffect, useState } from "react";
import { clientContractService, profileService } from "../../services/api.js";
import { useLocation, useNavigate } from "react-router-dom";

export default function CreateContract() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedFreelancer = location.state?.preselectedFreelancer || null;
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "ETH",
    deadline: "",
    conditions: "",
    freelancer: preselectedFreelancer?._id || preselectedFreelancer?.id || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [freelancers, setFreelancers] = useState([]);
  const [inviteMode, setInviteMode] = useState(Boolean(preselectedFreelancer));
  const [loadingFreelancers, setLoadingFreelancers] = useState(false);

  useEffect(() => {
    if (preselectedFreelancer) {
      setForm((prev) => ({
        ...prev,
        freelancer: preselectedFreelancer._id || preselectedFreelancer.id || "",
      }));
    }
  }, [preselectedFreelancer]);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoadingFreelancers(true);
        const { data } = await profileService.getFreelancerList();
        setFreelancers(data || []);
      } catch (err) {
        console.warn("Failed to load freelancers list", err);
      } finally {
        setLoadingFreelancers(false);
      }
    };
    fetchFreelancers();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        freelancer: inviteMode ? form.freelancer : null,
      };
      if (inviteMode && !payload.freelancer) {
        setSubmitting(false);
        return setError("Please select a freelancer to invite");
      }
      await clientContractService.createContract(payload);
      // Simple toast-like banner
      alert("✅ Contract created successfully");
      navigate("/client/contracts");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create contract");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-bold">Create Contract</h1>
        <p className="text-xs md:text-sm text-gray-400">
          Step-based layout with Web3 styling
        </p>
        {preselectedFreelancer && (
          <p className="mt-2 text-sm text-cyan-300">
            Inviting:{" "}
            {preselectedFreelancer.username || preselectedFreelancer.name}
          </p>
        )}
        {!preselectedFreelancer && inviteMode && (
          <p className="mt-2 text-sm text-cyan-300">
            Waiting for invited freelancer response. Contract will stay private
            until they accept or decline.
          </p>
        )}
      </header>

      {error && (
        <div className="p-3 rounded-lg bg-red-600/20 text-red-200 border border-red-600/30 text-sm">
          ⚠️ {error}
        </div>
      )}

      <form
        onSubmit={submit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4"
      >
        <div className="p-3 md:p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
          <h2 className="text-base md:text-lg font-semibold mb-3">1. Basics</h2>
          <div className="space-y-3">
            <Input
              label="Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
            />
            <TextArea
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
            />
          </div>
        </div>

        <div className="p-3 md:p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
          <h2 className="text-base md:text-lg font-semibold mb-3">2. Escrow</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount"
              value={form.amount}
              onChange={(v) => setForm({ ...form, amount: v })}
              type="number"
            />
            <Select
              label="Currency"
              value={form.currency}
              onChange={(v) => setForm({ ...form, currency: v })}
              options={["ETH", "USDT"]}
            />
            <div className="col-span-2">
              <Input
                label="Deadline"
                value={form.deadline}
                onChange={(v) => setForm({ ...form, deadline: v })}
                type="date"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-3 md:p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
          <h2 className="text-base md:text-lg font-semibold mb-3">
            3. Conditions
          </h2>
          <TextArea
            label="Delivery conditions"
            value={form.conditions}
            onChange={(v) => setForm({ ...form, conditions: v })}
          />
        </div>

        <div className="lg:col-span-2 p-3 md:p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
          <h2 className="text-base md:text-lg font-semibold mb-3">
            4. Invite (optional)
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={inviteMode}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setInviteMode(checked);
                  if (!checked) {
                    setForm((prev) => ({ ...prev, freelancer: "" }));
                  }
                }}
              />
              Invite a specific freelancer (private until they respond)
            </label>

            {inviteMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  label="Select Freelancer"
                  value={form.freelancer}
                  onChange={(v) => setForm({ ...form, freelancer: v })}
                  options={freelancers.map((f) => ({
                    value: f._id,
                    label: f.username || f.email || "Freelancer",
                  }))}
                  placeholder={
                    loadingFreelancers ? "Loading..." : "Choose freelancer"
                  }
                />
                <div className="text-xs text-gray-400">
                  Invited contracts stay private until the invite is accepted or
                  declined. Declined invites reopen to the public marketplace.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex justify-end">
          <button
            disabled={submitting}
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 font-medium"
          >
            {submitting ? "Submitting..." : "Submit Contract"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm focus:border-cyan-400 outline-none"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm focus:border-cyan-400 outline-none"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm focus:border-cyan-400 outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}
