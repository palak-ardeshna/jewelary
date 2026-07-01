"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Slim gold progress bar that pulses across the top on route changes, giving
// navigation a smooth, "something is happening" feel. Lightweight: keys off
// pathname changes (no external deps). Respects reduced-motion.
export function RouteProgress() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; } // don't run on initial mount
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    setVisible(true); setWidth(12);
    const t1 = setTimeout(() => setWidth(72), 40);
    const t2 = setTimeout(() => setWidth(100), 260);
    const t3 = setTimeout(() => { setVisible(false); setWidth(0); }, 560);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [pathname]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 100, pointerEvents: "none" }} aria-hidden="true">
      <div
        style={{
          height: "100%", width: `${width}%`,
          background: "linear-gradient(90deg, var(--gold, #b08d4f), var(--gold-soft, #d9c3a0))",
          opacity: visible ? 1 : 0,
          transition: "width 320ms cubic-bezier(.22,1,.36,1), opacity 250ms ease",
          boxShadow: visible ? "0 0 8px rgba(176,141,79,0.6)" : "none",
        }}
      />
    </div>
  );
}
