"use client";
import { useRef } from "react";

export default function MagneticButton({ as: Tag = "a", className = "", children, ...props }) {
  const ref = useRef(null);

  function onMouseMove(e) {
    const btn = ref.current;
    if (!btn || window.matchMedia("(hover: none)").matches) return;
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transition = "transform .08s linear";
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  }
  function onMouseLeave() {
    const btn = ref.current;
    if (!btn) return;
    btn.style.transition = "transform .45s cubic-bezier(.34,1.56,.64,1)";
    btn.style.transform = "translate(0,0)";
  }

  return (
    <Tag ref={ref} className={className} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} {...props}>
      {children}
    </Tag>
  );
}
