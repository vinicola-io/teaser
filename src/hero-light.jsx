import React, { useEffect } from "react";

// Lighting stays behind the bottle. No lines, sweep beams or pointer tracking.
export function HeroLight() {
  return (
    <div className="hero-atmosphere" aria-hidden="true">
      <div className="hero-light-pool" />
      <div className="hero-light-softbox" />
    </div>
  );
}

export function useHeroLight(heroRef) {
  useEffect(() => {
    const hero = heroRef.current;
    const area = hero?.querySelector(".hero-atmosphere");
    if (!hero || !area || typeof window.matchMedia !== "function" ||
        typeof window.IntersectionObserver !== "function") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      hero.dataset.ambientRunning = String(visible && !reduce.matches && !document.hidden);
    };
    const observer = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === area);
      if (!entry) return;
      visible = entry.isIntersecting && entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0;
      update();
    }, { threshold: 0 });

    // CSS owns the loop; pausing preserves its phase on exit and tab hiding.
    hero.dataset.ambientReady = "true";
    update();
    observer.observe(area);
    reduce.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      delete hero.dataset.ambientRunning;
      delete hero.dataset.ambientReady;
    };
  }, [heroRef]);
}
