"use client";

import { useEffect, useRef } from "react";

interface Blob {
  color: string;
  size: string;
  left: string;
  top: string;
  /** Parallax travel in pixels at full pointer deflection — larger reads as nearer. */
  depth: number;
  drift: "a" | "b" | "c";
  duration: string;
  reverse?: boolean;
  opacity: number;
}

const BLOBS: Blob[] = [
  { color: "var(--color-neon-violet-deep)", size: "46rem", left: "6%", top: "10%", depth: 48, drift: "a", duration: "24s", opacity: 0.5 },
  { color: "var(--color-neon-pink-deep)", size: "40rem", left: "68%", top: "6%", depth: 72, drift: "b", duration: "28s", opacity: 0.42 },
  { color: "var(--color-neon-green-deep)", size: "44rem", left: "60%", top: "64%", depth: 40, drift: "c", duration: "30s", opacity: 0.34 },
  { color: "var(--color-neon-blue-deep)", size: "38rem", left: "10%", top: "68%", depth: 64, drift: "b", duration: "26s", reverse: true, opacity: 0.4 },
  { color: "var(--color-neon-cyan-deep)", size: "30rem", left: "42%", top: "38%", depth: 88, drift: "a", duration: "32s", reverse: true, opacity: 0.26 },
  { color: "var(--color-neon-violet)", size: "26rem", left: "82%", top: "46%", depth: 100, drift: "c", duration: "22s", opacity: 0.3 },
];

/**
 * App-wide flowing cinema light. Layered radial-gradient blobs drift on their own and
 * glide toward the pointer with damped parallax; a soft glow tracks the cursor directly.
 * Transform-only updates on a single rAF loop (no blur filters) keep scrolling smooth.
 */
export function FluidBackground() {
  const wrappers = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let raf = 0;
    let running = false;
    let hasPointer = false;
    // Normalized pointer (-1..1) and pixel position, each with a damped current value.
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let px = window.innerWidth / 2, py = window.innerHeight / 2, gx = px, gy = py;

    const tick = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      gx += (px - gx) * 0.09;
      gy += (py - gy) * 0.09;
      for (let i = 0; i < wrappers.current.length; i++) {
        const el = wrappers.current[i];
        if (!el) continue;
        const depth = BLOBS[i].depth;
        el.style.transform = `translate3d(${(cx * depth).toFixed(2)}px, ${(cy * depth).toFixed(2)}px, 0)`;
      }
      const cursor = cursorRef.current;
      if (cursor) {
        cursor.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
        cursor.style.opacity = hasPointer ? "0.6" : "0";
      }
      const settled =
        Math.abs(tx - cx) < 0.0005 && Math.abs(ty - cy) < 0.0005 &&
        Math.abs(px - gx) < 0.3 && Math.abs(py - gy) < 0.3;
      if (settled) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hasPointer = true;
      tx = (event.clientX / window.innerWidth - 0.5) * 2;
      ty = (event.clientY / window.innerHeight - 0.5) * 2;
      px = event.clientX;
      py = event.clientY;
      start();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else if (hasPointer) {
        start();
      }
    };

    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fluid-bg">
      <div className="fluid-bg__base" />
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          ref={(el) => { wrappers.current[i] = el; }}
          className="fluid-bg__parallax"
          style={{ left: blob.left, top: blob.top, width: blob.size, height: blob.size }}
        >
          <div
            className="fluid-bg__blob"
            data-drift={blob.drift}
            style={{
              color: blob.color,
              opacity: blob.opacity,
              animationDuration: blob.duration,
              animationDirection: blob.reverse ? "reverse" : "normal",
            }}
          />
        </div>
      ))}
      <div ref={cursorRef} className="fluid-bg__cursor" />
      <div className="fluid-bg__vignette" />
    </div>
  );
}