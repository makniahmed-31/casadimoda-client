"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

export default function AnnouncementBar() {
  const t = useTranslations("announcement");
  const [isVisible, setIsVisible] = useState(true);

  const announcements = [
    t("freeShipping"),
    t("newCollection"),
    t("vipAccess"),
  ];

  if (!isVisible) return null;

  return (
    <div className="bg-[radial-gradient(circle_at_center,_#1e1e1d_0%,_#1e1e1d_25%,_#000_75%)] text-white/80 py-1.5 px-4 relative overflow-hidden">
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .scroll-container {
          animation: scroll-left 20s linear infinite;
        }
        .scroll-container:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-grow overflow-hidden relative">
          <div className="scroll-container flex items-center whitespace-nowrap">
            {announcements.map((text, index) => (
              <span
                key={`first-${index}`}
                className="inline-flex items-center gap-3 mx-8 text-[10px] md:text-xs font-medium tracking-wider uppercase"
              >
                <span className="text-accent">✦</span>
                {text}
              </span>
            ))}
            {announcements.map((text, index) => (
              <span
                key={`second-${index}`}
                className="inline-flex items-center gap-3 mx-8 text-[10px] md:text-xs font-medium tracking-wider uppercase"
              >
                <span className="text-accent">✦</span>
                {text}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X size={12} className="text-white/50 hover:text-white" />
        </button>
      </div>
    </div>
  );
}
