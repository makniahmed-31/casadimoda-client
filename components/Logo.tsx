import React from "react";

export const LogoIcon = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <text
      x="50"
      y="62"
      textAnchor="middle"
      fill="currentColor"
      fontSize="40"
      fontWeight="300"
      style={{ fontFamily: "var(--font-playfair), serif" }}
    >
      CM
    </text>
  </svg>
);

const Logo = ({ className = "h-10 w-auto" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="text-accent">
        <LogoIcon className="h-8 w-8" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xl font-bold tracking-[0.2em] text-white">
          CASA DI MODA
        </span>
        <span className="text-[10px] tracking-[0.4em] text-accent font-medium uppercase mt-1">
          Pure Elegance
        </span>
      </div>
    </div>
  );
};

export default Logo;
