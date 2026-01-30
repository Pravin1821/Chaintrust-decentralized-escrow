import { useState } from "react";
import { clientContractService } from "../../services/api.js";
import { useNavigate } from "react-router-dom";

export default function CreateContract() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "ETH",
    deadline: "",
    conditions: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await clientContractService.createContract(form);
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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Create Contract</h1>
        <p className="text-sm text-gray-400">
          Step-based layout with Web3 styling
        </p>
      </header>

      {error && (
        <div className="p-3 rounded-lg bg-red-600/20 text-red-200 border border-red-600/30 text-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
          <h2 className="text-lg font-semibold mb-3">1. Basics</h2>
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

        <div className="p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
          <h2 className="text-lg font-semibold mb-3">2. Escrow</h2>
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
            <Input
              label="Deadline"
              value={form.deadline}
              onChange={(v) => setForm({ ...form, deadline: v })}
              type="date"
            />
          </div>
        </div>

        <div className="md:col-span-2 p-4 bg-gray-900/60 border border-gray-800/60 rounded-xl">
          <h2 className="text-lg font-semibold mb-3">3. Conditions</h2>
          <TextArea
            label="Delivery conditions"
            value={form.conditions}
            onChange={(v) => setForm({ ...form, conditions: v })}
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            disabled={submitting}
            type="submit"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
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

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm focus:border-cyan-400 outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
