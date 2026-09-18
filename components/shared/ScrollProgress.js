"use client";
import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef(null);
  const pctRef = useRef(null);
  const hideTimer = useRef(null);

  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      if (barRef.current) barRef.current.style.width = pct + "%";
      if (pctRef.current) {
        pctRef.current.textContent = Math.round(pct) + "%";
        pctRef.current.classList.add("show");
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => pctRef.current?.classList.remove("show"), 900);
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <div className="scroll-progress-bar" ref={barRef} />
      </div>
      <span className="scroll-percent mono" ref={pctRef}>
        0%
      </span>
    </>
  );
}
