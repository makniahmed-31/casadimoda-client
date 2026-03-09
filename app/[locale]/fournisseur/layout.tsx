"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Store,
  Settings,
  ChevronRight,
  LogOut,
  Menu,
  X,
  AlertCircle,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { apiFetch } from "@/utils/api";

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("supplier");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const sidebarLinks = [
    { name: "dashboard", href: "/supplier", icon: LayoutDashboard },
    { name: "myProducts", href: "/supplier/products", icon: Package },
    { name: "orders", href: "/supplier/orders", icon: ShoppingCart },
    { name: "analytics", href: "/supplier/analytics", icon: BarChart3 },
    { name: "myStore", href: "/supplier/profile", icon: Store },
    { name: "settings", href: "/supplier/settings", icon: Settings },
  ];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [supplierStatus, setSupplierStatus] = useState<string | null>(null);

  useEffect(() => {
    // Fetch supplier status
    const fetchStatus = async () => {
      try {
        const res = await apiFetch("/api/supplier/profile");
        if (res.ok) {
          const data = await res.json();
          setSupplierStatus(data.status);
        }
      } catch (error) {
        console.error("Error fetching supplier status:", error);
      }
    };

    if (session?.user?.supplierId) {
      fetchStatus();
    }
  }, [session]);

  // Redirect if not authenticated or not a supplier
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (session?.user?.role !== "supplier") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="text-center max-w-md p-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-primary mb-2">
            {t("accessDenied")}
          </h2>
          <p className="text-text-dark/60 mb-6">{t("needSupplierAccount")}</p>
          <Link
            href="/become-supplier"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3  font-bold hover:bg-accent/90 transition-colors"
          >
            {t("becomeSupplier")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FDFCFB] relative overflow-hidden">
      {/* Pending/Rejected Status Banner */}
      {supplierStatus === "pending" && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 py-2 px-4 text-center text-sm font-bold z-[100]">
          Your supplier account is pending approval. You can view your dashboard
          but cannot add products yet.
        </div>
      )}
      {supplierStatus === "rejected" && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white py-2 px-4 text-center text-sm font-bold z-[100]">
          Your supplier application was rejected. Please contact support for
          more information.
        </div>
      )}
      {supplierStatus === "suspended" && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 text-center text-sm font-bold z-[100]">
          Your supplier account has been suspended. Please contact support.
        </div>
      )}

      {/* Mobile Top Header */}
      <header
        className={`lg:hidden flex items-center justify-between px-6 py-4 bg-primary text-white sticky z-40 shadow-md ${
          supplierStatus && supplierStatus !== "approved" ? "top-8" : "top-0"
        }`}
      >
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
            Supplier Portal
          </span>
        </Link>
        <div className="w-10" />
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
          ${supplierStatus && supplierStatus !== "approved" ? "lg:pt-8" : ""}
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
              Supplier<span className="text-accent ml-0.5">.</span>
            </span>
          </Link>
        </div>

        {/* Mobile Sidebar Brand */}
        <div className="lg:hidden p-8 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent  flex items-center justify-center">
              <span className="text-white font-black text-lg italic">C</span>
            </div>
            <span className="font-bold tracking-tight uppercase">
              Supplier Portal
            </span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X size={24} className="text-accent" />
          </button>
        </div>

        <nav className="flex-grow p-6 space-y-2 mt-4 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4 ml-4">
            Management
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
                    {link.name}
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
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-grow p-2 md:p-6 lg:p-10 overflow-y-auto w-full ${
          supplierStatus && supplierStatus !== "approved"
            ? "pt-14 lg:pt-10"
            : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
