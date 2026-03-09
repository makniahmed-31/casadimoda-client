"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Truck, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";

export default function TransporterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("transporter");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive =
    pathname.endsWith("/transporter") || pathname.includes("/transporter");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-primary">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-primary sticky top-0 z-40 shadow-md border-b border-white/5">
        <button
          onClick={() => setOpen(true)}
          className="p-2 hover:bg-white/10 transition-colors"
        >
          <Menu size={22} className="text-accent" />
        </button>
        <span className="font-black uppercase tracking-tight text-sm text-white">
          {t("title")}
        </span>
        <div className="w-8" />
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[60]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} w-64 bg-primary border-r border-white/5 text-white flex flex-col fixed lg:relative h-screen z-[70] transition-transform duration-300 shrink-0`}
      >
        <div className="p-7 border-b border-white/5 hidden lg:flex items-center gap-3">
          <div className="w-9 h-9 bg-accent flex items-center justify-center">
            <Truck size={18} className="text-primary" />
          </div>
          <span className="font-black uppercase tracking-tight text-sm">
            {t("title")}
            <span className="text-accent">.</span>
          </span>
        </div>

        <div className="lg:hidden p-6 border-b border-white/5 flex items-center justify-between">
          <span className="font-black uppercase tracking-tight text-sm">
            {t("title")}
          </span>
          <button onClick={() => setOpen(false)}>
            <X size={20} className="text-accent" />
          </button>
        </div>

        <nav className="flex-grow p-5 mt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4 ml-3">
            {t("navigation")}
          </p>
          <Link
            href="/transporter"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3.5 transition-all ${isActive ? "bg-accent text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
          >
            <Truck size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span
              className={`text-sm ${isActive ? "font-black" : "font-medium"}`}
            >
              {t("deliveries")}
            </span>
          </Link>
        </nav>

        <div className="p-5 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm cursor-pointer"
          >
            <LogOut size={18} />
            {t("signOut")}
          </button>
        </div>
      </aside>

      <main className="flex-grow p-2 md:p-6 lg:p-10 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
