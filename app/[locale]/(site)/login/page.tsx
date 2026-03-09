"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type LoginInput = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");
  const n = useTranslations("nav");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ defaultValues: { email: "", password: "" } });

  const onSubmit = async ({ email, password }: LoginInput) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) alert(result.error);
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
      alert((err as Error).message || "An error occurred");
    }
  };

  return (
    <div
      className="min-h-[calc(100dvh-var(--header-height,80px))] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bgg.webp')" }}
    >
      {/* Breadcrumb */}
      <div className="px-8 md:px-16 pt-8">
        <p className="text-white/40 text-xs">
          <Link href="/" className="hover:text-accent transition-colors">
            {n("home")}
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-white/60">{n("login")}</span>
        </p>
      </div>

      <div className="flex items-center px-8 md:px-16 py-10 min-h-[80vh]">
        <div className="bg-secondary grid grid-cols-1 lg:grid-cols-2 gap-16 w-full max-w-6xl mx-auto items-center">
          {/* LEFT — Cream form card */}
          <div className="p-8 md:p-12 w-full">
            <h1 className="font-serif text-5xl  text-primary mb-8">
              {n("login")}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/50">
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
                  className={`w-full bg-white border ${errors.email ? "border-red-400" : "border-gray-200 focus:border-accent"} py-3.5 px-4 text-sm text-primary placeholder:text-gray-300 outline-none transition-all`}
                />
                {errors.email && (
                  <p className="text-[10px] font-bold text-red-500 uppercase">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/50">
                  {t("password")}
                </label>
                <input
                  {...register("password", {
                    required: t("passwordRequired"),
                    minLength: { value: 6, message: t("minChars") },
                  })}
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  className={`w-full bg-white border ${errors.password ? "border-red-400" : "border-gray-200 focus:border-accent"} py-3.5 px-4 text-sm text-primary placeholder:text-gray-300 outline-none transition-all`}
                />
                {errors.password && (
                  <p className="text-[10px] font-bold text-red-500 uppercase">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Link
                href="#"
                className="block text-right text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-accent transition-colors"
              >
                {t("forgot")}
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-black text-white font-black py-4 uppercase text-xs tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  n("login").toUpperCase()
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[10px] text-primary/30">{t("or")}</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Social buttons */}
            <div className="flex gap-3">
              <button className="flex-1 border border-gray-200 hover:border-accent bg-white py-3 flex items-center justify-center gap-2 text-xs font-bold text-primary transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
              <button className="flex-1 border border-gray-200 hover:border-accent bg-white py-3 flex items-center justify-center gap-2 text-xs font-bold text-primary transition-all cursor-pointer">
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

            <p className="text-center mt-6 text-xs text-primary/40">
              {t("noAccount")}{" "}
              <Link
                href="/register"
                className="font-black text-accent hover:text-primary uppercase tracking-widest transition-colors"
              >
                {t("joinUs")}
              </Link>
            </p>
          </div>

          {/* RIGHT — Phone mockups */}
          <div className="hidden lg:flex items-center justify-center relative h-[500px]">
            {/* Back phone */}
            <div className="absolute -left-4 w-48 h-[380px] rounded-[2rem] border-4 border-white/20 overflow-hidden rotate-y-25 rotate-x-5 rotate-z-15 shadow-2xl bg-primary/60">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full z-10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop"
                alt=""
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-5">
                <p className="text-white/50 text-[9px] uppercase tracking-widest font-bold">
                  BALENCIAGA
                </p>
                <p className="text-white font-bold text-sm">Sac Logo Noir</p>
                <p className="text-accent font-black text-base mt-0.5">
                  750 TND
                </p>
              </div>
            </div>
            {/* Front phone */}
            <div className="relative w-52 h-[420px] rounded-[2rem] border-4 border-white/30 overflow-hidden shadow-2xl bg-primary/80 z-10">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-white/30 rounded-full z-10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop"
                alt=""
                className="w-full h-full object-cover opacity-80"
              />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-5">
                <p className="text-white/50 text-[9px] uppercase tracking-widest font-bold">
                  Nike
                </p>
                <p className="text-white font-bold text-sm">SHOES</p>
                <p className="text-accent font-black text-base mt-0.5">
                  250 TND
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
