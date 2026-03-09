"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { animate } from "framer-motion";

interface FlyToCartProps {
  imageSrc: string;
  originRef: React.RefObject<HTMLElement | null>;
  onDone: () => void;
}

export default function FlyToCart({ imageSrc, originRef, onDone }: FlyToCartProps) {
  const flyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const flyEl = flyRef.current;
    const originEl = originRef.current;
    if (!flyEl || !originEl) { onDone(); return; }

    const cartEl = document.querySelector<HTMLElement>("[data-cart-icon]");
    if (!cartEl) { onDone(); return; }

    const originRect = originEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();

    const startX = originRect.left + originRect.width / 2 - 32;
    const startY = originRect.top + originRect.height / 2 - 32;
    const endX = cartRect.left + cartRect.width / 2 - 12;
    const endY = cartRect.top + cartRect.height / 2 - 12;

    flyEl.style.left = `${startX}px`;
    flyEl.style.top = `${startY}px`;

    const duration = 0.65;

    animate(startX, endX, {
      duration,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => { flyEl.style.left = `${v}px`; },
    });

    animate(startY, endY, {
      duration,
      ease: [0.4, 0, 0.6, 1],
      onUpdate: (v) => { flyEl.style.top = `${v}px`; },
    });

    animate(64, 24, {
      duration,
      ease: "easeIn",
      onUpdate: (v) => {
        flyEl.style.width = `${v}px`;
        flyEl.style.height = `${v}px`;
      },
    });

    animate(1, 0, {
      duration,
      delay: 0.4,
      ease: "easeIn",
      onUpdate: (v) => { flyEl.style.opacity = `${v}`; },
      onComplete: onDone,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      ref={flyRef}
      style={{
        position: "fixed",
        width: 64,
        height: 64,
        borderRadius: "50%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 9999,
        border: "2px solid #c9a96e",
        boxShadow: "0 4px 20px rgba(201,169,110,0.4)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>,
    document.body
  );
}
