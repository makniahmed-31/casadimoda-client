"use client";

import ImageUpload from "@/components/ImageUpload";
import { apiFetch } from "@/utils/api";
import { Save, Star, Store } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SupplierProfile {
  businessName: string;
  businessDescription: string;
  businessLogo: string;
  businessBanner: string;
  contactPhone: string;
  contactEmail: string;
  status: string;
  rating: number;
  numReviews: number;
  commissionRate: number;
}

export default function SupplierProfilePage() {
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    businessDescription: "",
    businessLogo: "",
    businessBanner: "",
    contactPhone: "",
    contactEmail: "",
  });

  useEffect(() => {
    apiFetch("/api/supplier/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          businessDescription: data.businessDescription ?? "",
          businessLogo: data.businessLogo ?? "",
          businessBanner: data.businessBanner ?? "",
          contactPhone: data.contactPhone ?? "",
          contactEmail: data.contactEmail ?? "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/api/supplier/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            My <span className="text-accent">Store</span>
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">{profile?.businessName}</p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.rating ? (
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                {profile.rating.toFixed(1)} ({profile.numReviews} reviews)
              </span>
            </div>
          ) : null}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-primary px-5 py-2.5 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 text-green-400 text-sm font-bold">
          Profile updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Store Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner */}
          <div className="bg-white/5 border border-white/10 p-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-4">Store Banner</p>
            {form.businessBanner && (
              <div className="relative w-full h-32 mb-4 overflow-hidden border border-white/10">
                <Image src={form.businessBanner} alt="Banner" fill sizes="100vw" className="object-cover" />
              </div>
            )}
            <ImageUpload
              onSuccess={(url) => setForm((f) => ({ ...f, businessBanner: url }))}
              label="Upload Banner"
              buttonClassName="text-[9px] font-black uppercase tracking-widest text-accent border border-accent/30 px-4 py-2 hover:bg-accent/10 transition-all cursor-pointer"
            />
          </div>

          {/* Description */}
          <div className="bg-white/5 border border-white/10 p-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Store Description</p>
            <textarea
              value={form.businessDescription}
              onChange={(e) => setForm((f) => ({ ...f, businessDescription: e.target.value }))}
              rows={5}
              className="w-full bg-white/5 border border-white/10 focus:border-accent p-4 text-sm text-white placeholder:text-white/20 outline-none transition-all resize-none"
              placeholder="Describe your store..."
            />
          </div>

          {/* Contact */}
          <div className="bg-white/5 border border-white/10 p-6 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Contact Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">
                  Phone
                </label>
                <input
                  value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 focus:border-accent py-2.5 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                  placeholder="+216 XX XXX XXX"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">
                  Email
                </label>
                <input
                  value={form.contactEmail}
                  onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 focus:border-accent py-2.5 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                  placeholder="contact@store.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Logo & Status */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-white/5 border border-white/10 p-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-4">Store Logo</p>
            <div className="flex flex-col items-center gap-4">
              {form.businessLogo ? (
                <div className="relative w-24 h-24 overflow-hidden border border-white/10">
                  <Image src={form.businessLogo} alt="Logo" fill sizes="96px" className="object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center">
                  <Store size={32} className="text-white/20" />
                </div>
              )}
              <ImageUpload
                onSuccess={(url) => setForm((f) => ({ ...f, businessLogo: url }))}
                label="Upload Logo"
                buttonClassName="text-[9px] font-black uppercase tracking-widest text-accent border border-accent/30 px-4 py-2 hover:bg-accent/10 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white/5 border border-white/10 p-6 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Account Status</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  profile?.status === "approved"
                    ? "bg-green-400"
                    : profile?.status === "pending"
                      ? "bg-yellow-400"
                      : "bg-red-400"
                }`}
              />
              <span className="text-sm font-black text-white capitalize">{profile?.status}</span>
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Commission Rate</p>
              <p className="text-2xl font-black text-accent">{profile?.commissionRate ?? 15}%</p>
            </div>
            {profile?.rating ? (
              <div className="pt-2 border-t border-white/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <p className="text-lg font-black text-white">{profile.rating.toFixed(1)}</p>
                  <span className="text-xs text-white/30">({profile.numReviews})</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
