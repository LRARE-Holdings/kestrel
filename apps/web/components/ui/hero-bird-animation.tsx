"use client";

import { useState, useEffect, useId } from "react";

/** 8 hand-crafted paths sweeping across the top of the hero (Y ~110-220), above the headline. */
const FLIGHT_PATHS = [
  "M-80,160 C200,130 400,110 600,140 C800,170 1000,140 1200,120 C1350,110 1450,130 1520,150",
  "M-80,190 C200,160 400,180 600,150 C800,130 1000,160 1200,180 C1350,190 1450,170 1520,160",
  "M-80,140 C200,170 400,130 600,160 C800,180 1000,150 1200,130 C1350,125 1450,140 1520,155",
  "M-80,200 C200,180 400,150 600,170 C800,190 1000,170 1200,150 C1350,140 1450,155 1520,165",
  "M-80,120 C200,140 400,170 600,150 C800,130 1000,145 1200,160 C1350,170 1450,155 1520,145",
  "M-80,175 C200,150 400,190 600,170 C800,145 1000,175 1200,155 C1350,145 1450,160 1520,170",
  "M-80,150 C200,120 400,160 600,135 C800,155 1000,130 1200,145 C1350,155 1450,140 1520,135",
  "M-80,210 C200,190 400,170 600,185 C800,200 1000,180 1200,170 C1350,165 1450,175 1520,180",
];

function pickRandomPath(): string {
  return FLIGHT_PATHS[Math.floor(Math.random() * FLIGHT_PATHS.length)];
}

const CYCLE_MS = 14000;

export function HeroBirdAnimation() {
  const id = useId().replace(/:/g, "");
  const [path, setPath] = useState(() => pickRandomPath());

  useEffect(() => {
    const interval = setInterval(() => {
      setPath(pickRandomPath());
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  const cls = {
    trail: `ht-${id}`,
    trailGlow: `htg-${id}`,
    bird: `hb-${id}`,
    wingL: `hwl-${id}`,
    wingR: `hwr-${id}`,
  };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-grid" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path key={path} d={path} stroke="var(--raw-kestrel)" strokeWidth="1.5" strokeLinecap="round" fill="none" className={cls.trail} />
        <path key={path + "-glow"} d={path} stroke="var(--raw-sage)" strokeWidth="8" strokeLinecap="round" fill="none" className={cls.trailGlow} />
        <g key={path + "-bird"} className={cls.bird}>
          <line x1="0" y1="0" x2="-16" y2="-4" stroke="var(--raw-kestrel)" strokeWidth="2" strokeLinecap="round" className={cls.wingL} />
          <line x1="0" y1="0" x2="-16" y2="4" stroke="var(--raw-kestrel)" strokeWidth="2" strokeLinecap="round" className={cls.wingR} />
          <line x1="8" y1="0" x2="-10" y2="0" stroke="var(--raw-kestrel)" strokeWidth="2" strokeLinecap="round" />
          <line x1="-10" y1="0" x2="-14" y2="-3" stroke="var(--raw-kestrel)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="-10" y1="0" x2="-14" y2="3" stroke="var(--raw-kestrel)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </g>
      </svg>

      <style>{`
        .${cls.trail} {
          stroke-dasharray: 2200;
          stroke-dashoffset: 2200;
          animation: hero-draw-trail ${CYCLE_MS}ms ease-in-out forwards;
        }
        .${cls.trailGlow} {
          stroke-dasharray: 2200;
          stroke-dashoffset: 2200;
          animation: hero-draw-trail ${CYCLE_MS}ms ease-in-out 200ms forwards;
          opacity: 0.06;
        }
        @keyframes hero-draw-trail {
          0%   { stroke-dashoffset: 2200; opacity: 0; }
          5%   { opacity: 0.2; }
          55%  { stroke-dashoffset: 0; opacity: 0.2; }
          75%  { stroke-dashoffset: 0; opacity: 0; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        .${cls.bird} {
          offset-path: path("${path}");
          offset-rotate: auto;
          animation: hero-fly ${CYCLE_MS}ms ease-in-out forwards;
        }
        @keyframes hero-fly {
          0%   { offset-distance: 0%;   opacity: 0; }
          4%   { offset-distance: 2%;   opacity: 0.8; }
          50%  { offset-distance: 95%;  opacity: 0.8; }
          58%  { offset-distance: 100%; opacity: 0; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        .${cls.wingL} {
          transform-origin: 0px 0px;
          animation: hero-flap-l 0.4s ease-in-out infinite;
        }
        @keyframes hero-flap-l {
          0%   { transform: rotate(0deg); }
          50%  { transform: rotate(-30deg); }
          100% { transform: rotate(0deg); }
        }
        .${cls.wingR} {
          transform-origin: 0px 0px;
          animation: hero-flap-r 0.4s ease-in-out infinite;
        }
        @keyframes hero-flap-r {
          0%   { transform: rotate(0deg); }
          50%  { transform: rotate(30deg); }
          100% { transform: rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .${cls.bird}, .${cls.wingL}, .${cls.wingR}, .${cls.trail}, .${cls.trailGlow} {
            animation: none !important;
          }
          .${cls.bird} { opacity: 0; }
          .${cls.trail} { stroke-dashoffset: 0; opacity: 0.08; }
        }
      `}</style>
    </div>
  );
}
