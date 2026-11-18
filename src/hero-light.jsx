import React, { useCallback, useEffect, useRef, useState } from "react";

const DURATION = 3800;
const START_RATIO = 0.2;

// One hero per page: keep this ID deterministic for prerender/hydration.
export function HeroLight() {
  return (
    <div className="hero-atmosphere" aria-hidden="true">
      <div className="hero-glow" />
      <div className="hero-beam" />
      <svg className="hero-filament" viewBox="0 0 1200 800" fill="none" focusable="false" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="vinicola-hero-light-gradient" x1="480" y1="0" x2="1120" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8d3c59" stopOpacity="0" />
            <stop offset="0.32" stopColor="#b66b84" stopOpacity="0.7" />
            <stop offset="0.62" stopColor="#edc4ce" />
            <stop offset="1" stopColor="#a95c76" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M640 176C1010 248 1088 582 798 626C626 654 510 586 480 520" stroke="url(#vinicola-hero-light-gradient)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function useHeroLight(heroRef) {
  const [available, setAvailable] = useState(false);
  const [running, setRunning] = useState(false);
  const controller = useRef(null);
  const played = useRef(false);
  const onToggle = useCallback(() => controller.current?.toggle(), []);

  useEffect(() => {
    const hero = heroRef.current;
    const area = hero?.querySelector(".hero-atmosphere");
    const glow = area?.querySelector(".hero-glow");
    const beam = area?.querySelector(".hero-beam");
    const filament = area?.querySelector(".hero-filament");
    if (!hero || !area || !glow || !beam || !filament) return;
    if (typeof window.matchMedia !== "function" || typeof window.IntersectionObserver !== "function" ||
        [glow, beam, filament].some(element => typeof element.animate !== "function")) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let alive = true, failed = false, enabled = false, active = false;
    let visible = false, startVisible = false, isRunning = false;
    let generation = 0, animations = [], pointerFrame = 0;
    let pointerAttached = false, clientX = 0, clientY = 0;

    const resetPointer = () => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      glow.style.removeProperty("transform");
    };
    const setActive = value => {
      active = value;
      hero.dataset.lightActive = String(value);
    };
    const stop = () => {
      generation += 1;
      for (const animation of animations) animation.cancel();
      animations = [];
      isRunning = false;
      setActive(false);
      resetPointer();
      if (alive) setRunning(false);
    };
    const movePointer = event => {
      if (event.pointerType !== "mouse" || !enabled || !fine.matches || !active || !visible || document.hidden) return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!alive || !enabled || !fine.matches || !active || !visible || document.hidden) return;
        const rect = area.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.max(-1, Math.min(1, (clientX - rect.left) / rect.width * 2 - 1)) * 24;
        const y = Math.max(-1, Math.min(1, (clientY - rect.top) / rect.height * 2 - 1)) * 18;
        glow.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });
    };
    const updatePointer = () => {
      const attach = enabled && fine.matches;
      if (attach === pointerAttached) return;
      pointerAttached = attach;
      if (attach) {
        hero.addEventListener("pointermove", movePointer, { passive: true });
        hero.addEventListener("pointerleave", resetPointer);
        hero.addEventListener("pointercancel", resetPointer);
      } else {
        hero.removeEventListener("pointermove", movePointer);
        hero.removeEventListener("pointerleave", resetPointer);
        hero.removeEventListener("pointercancel", resetPointer);
        resetPointer();
      }
    };
    const play = () => {
      if (!alive || !enabled || !visible || document.hidden) return;
      stop();
      played.current = true;
      setActive(true);
      const current = generation;
      const track = animation => {
        animation.finished.catch(() => {});
        animations.push(animation);
      };
      try {
        // Pointer owns glow.transform; this entrance only changes its opacity.
        track(glow.animate([
          { opacity: 0 }, { opacity: 0.45, offset: 0.28 },
          { opacity: 0.6, offset: 0.65 }, { opacity: 0.45 },
        ], { duration: DURATION, easing: "ease-in-out", iterations: 1, fill: "none" }));
        track(beam.animate([
          { opacity: 0, transform: "translate3d(-140%, 0, 0) rotate(-16deg)" },
          { opacity: 0.12, offset: 0.18 },
          { opacity: 0.34, offset: 0.48 },
          { opacity: 0.08, offset: 0.8 },
          { opacity: 0, transform: "translate3d(140%, 0, 0) rotate(-16deg)" },
        ], { duration: DURATION, easing: "linear", iterations: 1, fill: "none" }));
        track(filament.animate([
          { opacity: 0, transform: "translate3d(-12px, 9px, 0)" },
          { opacity: 0.18, offset: 0.26 },
          { opacity: 0.32, offset: 0.62 },
          { opacity: 0, transform: "translate3d(0, 0, 0)" },
        ], { duration: DURATION, easing: "ease-out", iterations: 1, fill: "none" }));
      } catch {
        failed = true;
        enabled = false;
        stop();
        updatePointer();
        if (alive) setAvailable(false);
        return;
      }
      isRunning = true;
      setRunning(true);
      const thisRun = animations;
      // Cancellation rejects finished; allSettled also consumes those rejections.
      Promise.allSettled(thisRun.map(animation => animation.finished)).then(results => {
        if (!alive || generation !== current) return;
        if (results.some(result => result.status === "rejected")) {
          stop();
          return;
        }
        animations = [];
        for (const animation of thisRun) animation.cancel();
        isRunning = false;
        setRunning(false);
        // Active CSS supplies the quiet fixed light after the one-pass ends.
      });
    };
    const maybeAutoplay = () => {
      if (!played.current && startVisible && !document.hidden) play();
    };
    const updateEligibility = () => {
      if (!alive) return;
      enabled = !reduce.matches && !failed;
      setAvailable(enabled);
      if (!enabled) stop();
      updatePointer();
      if (enabled) maybeAutoplay();
    };
    const visibilityChanged = () => {
      if (document.hidden) stop();
      else maybeAutoplay();
    };
    const observer = new IntersectionObserver(entries => {
      if (!alive) return;
      const entry = entries.find(item => item.target === area);
      if (!entry) return;
      visible = entry.isIntersecting && entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0;
      startVisible = visible && entry.intersectionRatio >= START_RATIO;
      if (!visible) stop();
      else maybeAutoplay();
    }, { threshold: [0, START_RATIO] });
    const control = { toggle: () => { if (isRunning) stop(); else play(); } };
    controller.current = control;
    reduce.addEventListener("change", updateEligibility);
    fine.addEventListener("change", updatePointer);
    document.addEventListener("visibilitychange", visibilityChanged);
    setActive(false);
    updateEligibility();
    observer.observe(area);

    return () => {
      alive = false;
      enabled = false;
      if (controller.current === control) controller.current = null;
      observer.disconnect();
      reduce.removeEventListener("change", updateEligibility);
      fine.removeEventListener("change", updatePointer);
      document.removeEventListener("visibilitychange", visibilityChanged);
      updatePointer();
      stop();
    };
  }, [heroRef]);

  return { available, running, onToggle };
}
