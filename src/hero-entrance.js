import { useEffect } from "react";

// The full composition is readable before hydration. Only two title lines
// receive a short entrance; native CSS owns any scroll-linked transforms.
export function useHeroEntrance(heroRef) {
  useEffect(() => {
    const hero = heroRef.current;
    const title = hero?.querySelector(".hero-title-motion");
    if (!hero || !title) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let alive = true, played = false;
    let animations = [];
    const cancel = () => {
      for (const animation of animations) animation.cancel();
      animations = [];
    };
    const enter = () => {
      if (!alive || played || reduce.matches || document.hidden) return;
      played = true;
      const lines = title.querySelectorAll(".hero-title-line");
      if ([...lines].some(line => typeof line.animate !== "function")) return;
      try {
        [...lines].forEach((line, index) => {
          const animation = line.animate([
            { transform: `translate3d(${index ? 12 : -12}px, 8px, 0)`, opacity: 0.8 },
            { transform: "translate3d(0, 0, 0)", opacity: 1 },
          ], { duration: 900, easing: "cubic-bezier(.2,.7,.2,1)", iterations: 1, fill: "none" });
          animation.finished.catch(() => {});
          animations.push(animation);
        });
      } catch { cancel(); }
    };
    hero.dataset.heroReady = "true";
    const preferenceChanged = () => { if (reduce.matches) cancel(); };
    const visibilityChanged = () => { if (document.hidden) cancel(); };
    reduce.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    let observer;
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.2)) {
          enter();
          observer.disconnect();
        }
      }, { threshold: 0.2 });
      observer.observe(title);
    }
    return () => {
      alive = false;
      observer?.disconnect();
      reduce.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      cancel();
      delete hero.dataset.heroReady;
    };
  }, [heroRef]);
}
