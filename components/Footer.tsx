import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Logo from "./Logo";

export default function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="py-12 border-t border-gray-100 bg-primary text-secondary">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <p className="text-secondary/60 text-sm font-medium tracking-wide uppercase">
          {t("allRightsReserved")}
        </p>
        <div className="mt-4 flex justify-center gap-6 text-xs text-accent uppercase tracking-widest font-bold">
          <a href="#" className="hover:text-white transition-colors">
            {t("privacy")}
          </a>
          <a href="#" className="hover:text-white transition-colors">
            {t("terms")}
          </a>
          <a href="#" className="hover:text-white transition-colors">
            {t("support")}
          </a>
        </div>
      </div>
    </footer>
  );
}
