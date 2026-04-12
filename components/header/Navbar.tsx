"use client";

import { Link } from "@/i18n/routing";
import { Crown, Menu, Package, ShoppingBag, Store } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const role = session?.user as { role?: string; isAdmin?: boolean } | undefined;
  const showBecomeSupplier = !role?.isAdmin && role?.role !== "supplier" && role?.role !== "transporter";

  return (
    <div className="bg-primary/95 border-t border-white/10 px-2 md:px-4 py-1 flex items-center gap-2 md:gap-4 text-sm font-medium">
      <div
        onClick={onOpenSidebar}
        className="flex items-center gap-1 p-1 px-2 border border-transparent hover:border-accent cursor-pointer font-bold text-secondary group transition-all"
      >
        <Menu size={22} className="text-accent group-hover:scale-110 transition-transform" />
        <span className="hidden md:inline">{t("all")}</span>
      </div>

      <div className="flex-1 flex gap-2 md:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap py-1">
        <Link
          href="/products"
          className="flex items-center gap-2 p-1 px-2 border border-transparent hover:border-accent transition-all text-secondary/90 hover:text-white font-bold"
        >
          <ShoppingBag size={22} className="text-accent" />
          <span className="hidden md:inline">{t("allProducts")}</span>
        </Link>

        <Link
          href="/wholesale"
          className="flex items-center gap-2 p-1 px-2 border border-transparent hover:border-accent transition-all text-secondary/90 hover:text-white font-bold"
        >
          <Package size={22} className="text-accent" />
          <span className="hidden md:inline">{t("wholesale")}</span>
        </Link>

        <Link
          href="/vip-store"
          className="flex items-center gap-2 p-1 px-2 border border-transparent hover:border-accent transition-all text-secondary/90 hover:text-white font-bold"
        >
          <Crown size={22} className="text-accent" />
          <span className="hidden md:inline">{t("vipStore")}</span>
        </Link>
      </div>

      {showBecomeSupplier && (
        <Link
          href="/become-supplier"
          className="flex items-center gap-2 p-1 px-2 border border-accent/40 hover:border-accent transition-all text-accent hover:text-white font-bold whitespace-nowrap"
        >
          <Store size={22} className="text-accent" />
          <span className="hidden md:inline">{t("becomeSupplier")}</span>
        </Link>
      )}
    </div>
  );
}
