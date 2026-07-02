"use client";
import { useEffect } from "react";

export function FireworksConfetti() {
  useEffect(() => {
    let interval: any;
    
    async function startConfetti() {
      const canvasConfetti = await import("canvas-confetti");
      const confetti = canvasConfetti.default;
      
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#C9A96E", "#ffffff", "#1c1917"] // Champagne Gold, White, Onyx
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#C9A96E", "#ffffff", "#1c1917"]
      });
    }, 250);
    }
    
    startConfetti();
    
    return () => clearInterval(interval);
  }, []);

  return null;
}
