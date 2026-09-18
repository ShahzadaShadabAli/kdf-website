"use client";
import { useEffect, useRef } from "react";

// Decorative-only trailing cursor. Never gated on prefers-reduced-motion for
// its *creation* — it snaps instantly instead of disappearing (see globals.css'
// reduced-motion block, which zeroes transition durations globally).
export default function CursorRing() {
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const isTouchOnly =
      window.matchMedia("(hover: none), (pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches;
    if (isTouchOnly) return;

    document.body.classList.add("has-cursor");
    const ring = ringRef.current;
    let mx = -100,
      my = -100,
      rx = mx,
      ry = my,
      started = false,
      raf;

    function onMove(e) {
      mx = e.clientX;
      my = e.clientY;
      if (!started) {
        rx = mx;
        ry = my;
        started = true;
      }
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = prefersReducedMotion ? 1 : 0.18;

    function loop() {
      rx += (mx - rx) * ease;
      ry += (my - ry) * ease;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    }
    loop();
    window.addEventListener("mousemove", onMove);

    function onOver(e) {
      const swatch = e.target.closest(".swatch");
      const gtile = e.target.closest(".gtile");
      const link = e.target.closest("a, button");
      if (swatch) {
        ring.classList.add("big");
        if (labelRef.current) labelRef.current.textContent = "Shop";
      } else if (gtile) {
        ring.classList.add("big");
        if (labelRef.current) labelRef.current.textContent = "View";
      } else if (link) {
        ring.classList.add("big");
        if (labelRef.current) labelRef.current.textContent = "";
      }
    }
    function onOut(e) {
      const stillOn =
        e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".swatch, .gtile, a, button");
      if (!stillOn) {
        ring.classList.remove("big");
        if (labelRef.current) labelRef.current.textContent = "";
      }
    }
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div className="cursor-ring" ref={ringRef} aria-hidden="true">
      <span className="cursor-label" ref={labelRef} />
    </div>
  );
}
