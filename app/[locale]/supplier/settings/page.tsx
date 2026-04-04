"use client";

import { apiFetch } from "@/utils/api";
import { Eye, EyeOff, Lock, Save } from "lucide-react";
import { useState } from "react";

export default function SupplierSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await apiFetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.message || "Failed to update password." });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
          Account <span className="text-accent">Settings</span>
        </h1>
        <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">
          Manage your account preferences
        </p>
      </div>

      {message && (
        <div
          className={`p-4 border text-sm font-bold ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Change Password */}
      <div className="bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-accent/10 text-accent p-3">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Change Password</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-0.5">
              Update your login credentials
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 focus:border-accent py-2.5 px-4 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 focus:border-accent py-2.5 px-4 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 focus:border-accent py-2.5 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-primary px-5 py-2.5 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
