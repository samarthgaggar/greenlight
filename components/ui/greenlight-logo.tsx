"use client";

import { useCallback, useEffect, useRef } from "react";

/* Greenlight mark paths — viewBox 0 0 512 512, based on the brand logo */
const PATHS = {
  frame:
    "M100 72 C72 72 56 88 56 116 V396 C56 424 72 440 100 440 H412 C440 440 456 424 456 396 V116 C456 88 440 72 412 72 H100 Z",
  blueWave: "M132 318 C167 267 202 239 252 231 C306 222 343 187 380 138",
  greenWave: "M126 363 C174 361 216 344 252 311 C291 275 328 263 385 269",
  hub: "M253 231 m-42 0 a42 42 0 1 0 84 0 a42 42 0 1 0 -84 0",
  barLong: "M151 151 H238 V183 H151 Z",
  barShort: "M151 205 H206 V229 H151 Z",
  blueNode: "M379 138 m-18 0 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0",
  greenNode: "M126 363 m-18 0 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0",
  /* Combined stroke outline used for the draw-on effect */
  outline:
    "M100 72 C72 72 56 88 56 116 V396 C56 424 72 440 100 440 H412 C440 440 456 424 456 396 V116 C456 88 440 72 412 72 H100 Z " +
    "M132 318 C167 267 202 239 252 231 C306 222 343 187 380 138 " +
    "M126 363 C174 361 216 344 252 311 C291 275 328 263 385 269 " +
    "M253 231 m-42 0 a42 42 0 1 0 84 0 a42 42 0 1 0 -84 0 " +
    "M151 151 H238 M151 205 H206"
};

export function GreenlightLogoAnimation() {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduceMotion = useRef(false);

  const runDraw = useCallback(async () => {
    const { animate, svg } = await import("animejs");
    if (!svgRef.current || reduceMotion.current) return;

    const drawable = svg.createDrawable("#gl-cutLayer");
    const cutGroup = svgRef.current.querySelector("#gl-cut");

    animate(drawable, {
      draw: ["0 0", "0 1"],
      duration: 2800,
      ease: "inOutQuad",
      onComplete: () => {
        if (cutGroup) {
          animate(cutGroup, { opacity: 0, duration: 600, ease: "outQuad" });
        }
      }
    });
  }, []);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion.current) {
      const cut = svgEl.querySelector("#gl-cut") as SVGElement | null;
      if (cut) cut.style.opacity = "0";
      return;
    }

    const timer = setTimeout(runDraw, 800);

    const handleClick = () => {
      const cut = svgEl.querySelector("#gl-cut") as SVGElement | null;
      if (cut) cut.style.opacity = "1";
      runDraw();
    };

    svgEl.addEventListener("click", handleClick);
    return () => {
      clearTimeout(timer);
      svgEl.removeEventListener("click", handleClick);
    };
  }, [runDraw]);

  return (
    <div className="hero-logo-frame" aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox="0 0 512 512"
        preserveAspectRatio="xMidYMid meet"
        className="hero-logo-svg"
        role="img"
        aria-label="Greenlight logo animation"
      >
        <defs>
          <path id="gl-frame" d={PATHS.frame} />
          <path id="gl-blueWave" d={PATHS.blueWave} />
          <path id="gl-greenWave" d={PATHS.greenWave} />
          <path id="gl-hub" d={PATHS.hub} />
          <path id="gl-barLong" d={PATHS.barLong} />
          <path id="gl-barShort" d={PATHS.barShort} />
          <path id="gl-blueNode" d={PATHS.blueNode} />
          <path id="gl-greenNode" d={PATHS.greenNode} />
          <path id="gl-outline" d={PATHS.outline} fill="none" />

          <filter id="gl-paper" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="4" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#1a3028" surfaceScale="1.8" result="light">
              <feDistantLight azimuth="45" elevation="55" />
            </feDiffuseLighting>
            <feBlend in="SourceGraphic" in2="light" mode="screen" result="blend" />
          </filter>

          <filter id="gl-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>

          <radialGradient id="gl-centerGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1e4d38" />
            <stop offset="100%" stopColor="#06130e" />
          </radialGradient>

          <radialGradient id="gl-gradFrame" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stopColor="#0d2818" />
            <stop offset="100%" stopColor="#06130e" />
          </radialGradient>

          <radialGradient id="gl-gradGreen" cx="40%" cy="70%" r="65%">
            <stop offset="0%" stopColor="#1a6640" />
            <stop offset="100%" stopColor="#06130e" />
          </radialGradient>

          <radialGradient id="gl-gradBlue" cx="75%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#1a4a6e" />
            <stop offset="100%" stopColor="#06130e" />
          </radialGradient>

          <mask id="gl-maskFrame">
            <use href="#gl-frame" fill="white" />
          </mask>
          <mask id="gl-maskGreen">
            <use href="#gl-greenWave" stroke="white" strokeWidth="36" strokeLinecap="round" fill="none" />
            <use href="#gl-greenNode" fill="white" />
          </mask>
          <mask id="gl-maskBlue">
            <use href="#gl-blueWave" stroke="white" strokeWidth="32" strokeLinecap="round" fill="none" />
            <use href="#gl-blueNode" fill="white" />
          </mask>
          <mask id="gl-maskCore">
            <use href="#gl-hub" fill="white" />
            <use href="#gl-barLong" fill="white" />
            <use href="#gl-barShort" fill="white" />
          </mask>
        </defs>

        <g id="gl-layers">
          {/* Base paper texture */}
          <rect width="512" height="512" rx="72" fill="url(#gl-centerGlow)" filter="url(#gl-paper)" />

          {/* Layered depth via masked gradients */}
          <rect width="512" height="512" mask="url(#gl-maskFrame)" fill="url(#gl-gradFrame)" filter="url(#gl-paper)" opacity="0.97" />
          <rect width="512" height="512" mask="url(#gl-maskGreen)" fill="url(#gl-gradGreen)" filter="url(#gl-paper)" opacity="0.98" />
          <rect width="512" height="512" mask="url(#gl-maskBlue)" fill="url(#gl-gradBlue)" filter="url(#gl-paper)" opacity="0.99" />

          {/* Soft shadow under core */}
          <use href="#gl-outline" filter="url(#gl-blur)" stroke="#000" strokeWidth="2" opacity="0.2" />

          {/* Core hub + signal bars */}
          <rect width="512" height="512" mask="url(#gl-maskCore)" fill="#0d1f17" filter="url(#gl-paper)" />
          <use href="#gl-hub" fill="#35e985" />
          <circle cx="253" cy="231" r="21" fill="#06130e" />
          <use href="#gl-barLong" fill="#f1fff7" opacity="0.9" />
          <use href="#gl-barShort" fill="#9db7a8" opacity="0.85" />

          {/* Colored wave strokes (revealed beneath cut layer) */}
          <use href="#gl-blueWave" stroke="#3ccbff" strokeWidth="28" strokeLinecap="round" fill="none" />
          <use href="#gl-greenWave" stroke="#35e985" strokeWidth="32" strokeLinecap="round" fill="none" />
          <use href="#gl-blueNode" fill="#3ccbff" />
          <use href="#gl-greenNode" fill="#35e985" />

          {/* Draw-on cut layer */}
          <g id="gl-cut">
            <rect width="512" height="512" rx="72" fill="#06130e" filter="url(#gl-paper)" opacity="0.98" />
            <use href="#gl-outline" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" strokeDasharray="20 14" />
            <use id="gl-cutLayer" href="#gl-outline" stroke="#c8f0dc" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </svg>
      <p className="hero-logo-hint">Click to replay</p>
    </div>
  );
}
