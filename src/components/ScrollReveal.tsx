"use client";
import { useEffect } from "react";

/**
 * Motion infrastructure for the design system.
 * Any element with `data-reveal` fades + rises into place the first time it
 * enters the viewport. Honours prefers-reduced-motion (handled in globals.css,
 * which also sets the resting state to visible so no-JS / SSR is never blank).
 *
 * Mount once, high in the tree (layout). Uses a single IntersectionObserver and
 * a MutationObserver so client-navigated pages pick up new nodes automatically.
 */
export function ScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            // Optional stagger: data-reveal-delay="120" (ms)
            const delay = el.dataset.revealDelay;
            if (delay) el.style.transitionDelay = `${delay}ms`;
            el.classList.add("is-in");
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    const observeAll = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));

    observeAll();

    // Re-scan after client-side navigations inject new content.
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
