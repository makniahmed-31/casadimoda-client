"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  User,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  Heart,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tn = useTranslations("nav");
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: t("passwordMismatch") });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setMessage({ type: "error", text: t("passwordTooShort") });
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = { name };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await apiFetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.message || t("updateError") });
      } else {
        setMessage({ type: "success", text: t("updateSuccess") });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage({ type: "error", text: t("unknownError") });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div
        className="min-h-[calc(100dvh-var(--header-height,80px))] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/bgg.webp')" }}
      >
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100dvh-var(--header-height,80px))] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bgg.webp')" }}
    >
      {/* Breadcrumb */}
      <div className="px-8 md:px-16 pt-8">
        <p className="text-white/40 text-xs">
          <Link href="/" className="hover:text-accent transition-colors">
            {tn("home")}
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-white/60">{t("title")}</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        <h1 className="font-serif text-5xl md:text-6xl font-bold italic text-white mb-10">
          {t("title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 border border-white/10 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-accent/20 border border-accent/30 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-accent" />
                </div>
                <p className="text-white font-bold text-lg">
                  {session?.user?.name}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  {session?.user?.email}
                </p>
                <span className="mt-3 inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-accent/20 text-accent border border-accent/30">
                  {(session?.user as { role?: string })?.role || "Customer"}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                <Link
                  href="/orders"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white/60 hover:text-accent hover:bg-white/5 transition-colors"
                >
                  {t("myOrders")}
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white/60 hover:text-accent hover:bg-white/5 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                  {tn("favorites")}
                </Link>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-black/40 border border-white/10 p-8">
              {message && (
                <div
                  className={`flex items-center gap-3 p-4 mb-6 border ${message.type === "success" ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <p className="text-xs font-medium">{message.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Info section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-accent" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      {t("personalInfo")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        {t("fullName")}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-accent py-3 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        {t("emailLabel")}
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 py-3 px-4 text-sm text-white/40 outline-none cursor-not-allowed"
                      />
                      <p className="text-[10px] text-white/20">
                        {t("emailNote")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password section */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-accent" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      {t("changePassword")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        {t("currentPassword")}
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 focus:border-accent py-3 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                          {t("newPassword")}
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 focus:border-accent py-3 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                          {t("confirm")}
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 focus:border-accent py-3 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-primary font-black px-8 py-4 uppercase text-xs tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading ? t("saving") : t("save")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
