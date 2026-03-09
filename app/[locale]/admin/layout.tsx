"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  Gift,
  Ticket,
  Settings,
  ChevronRight,
  Layers,
  LogOut,
  Menu,
  X,
  Store,
  Clock,
  ShoppingBag,
  Palette,
  Truck,
} from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarLinks = [
  { name: "dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "shipping", href: "/admin/transporters", icon: Truck },
  { name: "products", href: "/admin/products", icon: Package },
  { name: "suppliers", href: "/admin/suppliers", icon: Store },
  { name: "approvals", href: "/admin/approvals", icon: Clock },
  { name: "colors", href: "/admin/colors", icon: Palette },
  { name: "brands", href: "/admin/brands", icon: Tag },
  { name: "categories", href: "/admin/categories", icon: Tag },
  { name: "subcategories", href: "/admin/subcategories", icon: Layers },
  { name: "giftCards", href: "/admin/giftcards", icon: Gift },
  { name: "coupons", href: "/admin/coupons", icon: Ticket },
  { name: "users", href: "/admin/users", icon: Users },
  { name: "settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-primary relative overflow-hidden">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-primary text-white sticky top-0 z-40 shadow-md">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-white/10  transition-colors order-first"
        >
          <Menu size={24} className="text-accent" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent  flex items-center justify-center">
            <span className="text-white font-black italic text-sm">C</span>
          </div>
          <span className="font-bold tracking-tight uppercase text-sm">
            {t("casaAdmin")}
          </span>
        </Link>
        <div className="w-10" /> {/* Spacer to keep logo semi-centered */}
      </header>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-primary/40 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-72 bg-primary text-white flex flex-col fixed lg:relative h-screen lg:h-auto shadow-2xl z-[70] transition-transform duration-300 ease-in-out shrink-0
        `}
      >
        <div className="p-8 border-b border-white/5 sticky top-0 bg-primary z-10 hidden lg:block">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 bg-accent  flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
              <span className="text-white font-black text-xl italic font-playfair">
                C
              </span>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase font-playfair">
              {t("casaAdmin")}
              <span className="text-accent ml-0.5">.</span>
            </span>
          </Link>
        </div>

        {/* Mobile Sidebar Brand (Visible only when sidebar is open on mobile) */}
        <div className="lg:hidden p-8 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent  flex items-center justify-center">
              <span className="text-white font-black text-lg italic">C</span>
            </div>
            <span className="font-bold tracking-tight uppercase">
              {t("adminPanel")}
            </span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X size={24} className="text-accent" />
          </button>
        </div>

        <nav className="flex-grow p-6 space-y-2 mt-4 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4 ml-4">
            {t("management")}
          </p>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-4  transition-all group ${
                  isActive
                    ? "bg-accent text-primary shadow-lg shadow-accent/20"
                    : "hover:bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span
                    className={`text-sm tracking-wide ${
                      isActive ? "font-black" : "font-medium"
                    }`}
                  >
                    {(t as (k: string) => string)(link.name)}
                  </span>
                </div>
                {isActive && (
                  <ChevronRight size={14} className="animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 sticky bottom-0 bg-primary mt-auto">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-4 px-4 py-4 text-white/40 hover:text-red-400 hover:bg-red-400/10  transition-all font-bold text-sm cursor-pointer"
          >
            <LogOut size={20} />
            {t("signOut")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-2 md:p-6 lg:p-10 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
