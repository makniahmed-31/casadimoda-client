"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("register");
  const n = useTranslations("nav");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError("");
    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || "Registration failed");
        return;
      }
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (signInResult?.error) setError(signInResult.error);
      else {
        const session = await getSession();
        const role = (session?.user as { role?: string })?.role;
        const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;
        if (isAdmin || role === "admin") router.push("/admin");
        else if (role === "supplier") router.push("/fournisseur");
        else if (role === "transporter") router.push("/transporter");
        else router.push("/");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred");
    }
  };

  return (
    <div
      className="min-h-[calc(100dvh-var(--header-height,80px))] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bgg.webp')" }}
    >
      <div className="flex items-center px-8 md:px-16 py-10 min-h-[85vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full max-w-6xl mx-auto items-start">
          {/* LEFT — Form */}
          <div className="py-8">
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-10">
              {t("createAccount")}
            </h1>

            {error && (
              <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 max-w-sm"
            >
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {t("fullName")}
                </label>
                <input
                  {...register("name", {
                    required: t("nameRequired"),
                    minLength: { value: 2, message: t("nameMinChars") },
                  })}
                  type="text"
                  placeholder={t("fullNamePlaceholder")}
                  className="w-full bg-white/10 border border-white/10 focus:border-accent py-3.5 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                />
                {errors.name && (
                  <p className="text-[10px] font-bold text-red-400 uppercase">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {t("emailAddress")}
                </label>
                <input
                  {...register("email", {
                    required: t("emailRequired"),
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: t("invalidEmail"),
                    },
                  })}
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="w-full bg-white/10 border border-white/10 focus:border-accent py-3.5 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                />
                {errors.email && (
                  <p className="text-[10px] font-bold text-red-400 uppercase">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {t("password")}
                </label>
                <input
                  {...register("password", {
                    required: t("passwordRequired"),
                    minLength: { value: 6, message: t("passwordMinChars") },
                  })}
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  className="w-full bg-white/10 border border-white/10 focus:border-accent py-3.5 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                />
                {errors.password && (
                  <p className="text-[10px] font-bold text-red-400 uppercase">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-black text-white font-black py-4 uppercase text-xs tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  t("submit")
                )}
              </button>
            </form>

            <p className="mt-4 max-w-sm">
              <Link
                href="#"
                className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-accent transition-colors"
              >
                {t("forgot")}
              </Link>
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-5 max-w-sm">
              <button className="flex-1 border border-white/10 hover:border-accent bg-white/5 py-3 flex items-center justify-center gap-2 text-xs font-bold text-white/70 transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                f
              </button>
              <button className="flex-1 border border-white/10 hover:border-accent bg-white/5 py-3 flex items-center justify-center gap-2 text-xs font-bold text-white/70 transition-all cursor-pointer">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
            </div>

            <p className="mt-6 text-sm text-white/40 max-w-sm">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="font-black text-accent hover:text-white uppercase tracking-widest transition-colors"
              >
                {n("login")}
              </Link>
            </p>
          </div>

          {/* RIGHT — Récachres actualités */}
          <div className="hidden lg:block py-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-5">
              {t("latestNews")}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {/* Sneakers */}
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=550&fit=crop"
                  alt="Sneakers"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Bag */}
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=550&fit=crop"
                  alt="Bag"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Louis Vuitton card */}
              <div className="bg-white/5 border border-white/10 p-4">
                <p className="text-white font-bold text-sm">Louis Vuitton</p>
                <p className="text-accent font-black text-base mt-1">
                  5,800 TND
                </p>
              </div>
              {/* Versace card */}
              <div className="bg-white/5 border border-white/10 p-4">
                <p className="text-white font-bold text-sm">Versace</p>
                <p className="text-accent font-black text-base mt-1">
                  1,400 TND
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
