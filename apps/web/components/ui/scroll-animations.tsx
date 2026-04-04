"use client";

import { type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from "framer-motion";
import { useRef } from "react";

/* ────────────────────────────────────────────────────
 * Shared easing + spring presets
 * ──────────────────────────────────────────────────── */

type CubicBezier = [number, number, number, number];
const EASE_OUT_EXPO: CubicBezier = [0.16, 1, 0.3, 1];
const EASE_OUT_QUINT: CubicBezier = [0.22, 1, 0.36, 1];

/* ────────────────────────────────────────────────────
 * 1. ScrollFade — fade-up / fade-in on scroll
 * ──────────────────────────────────────────────────── */

type FadeDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollFadeProps {
  children: ReactNode;
  direction?: FadeDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
}

const directionOffset = (dir: FadeDirection, distance: number) => {
  switch (dir) {
    case "up": return { y: distance };
    case "down": return { y: -distance };
    case "left": return { x: distance };
    case "right": return { x: -distance };
    case "none": return {};
  }
};

export function ScrollFade({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  distance = 40,
  className,
  once = true,
  threshold = 0.15,
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionOffset(direction, distance) }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{
        duration,
        delay,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────
 * 2. ScrollScale — scale-in on scroll
 * ──────────────────────────────────────────────────── */

interface ScrollScaleProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  from?: number;
  className?: string;
  once?: boolean;
}

export function ScrollScale({
  children,
  delay = 0,
  duration = 0.6,
  from = 0.92,
  className,
  once = true,
}: ScrollScaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: from }}
      animate={isInView ? { opacity: 1, scale: 1 } : undefined}
      transition={{
        duration,
        delay,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────
 * 3. ScrollReveal — clip-path reveal (wipe effect)
 * ──────────────────────────────────────────────────── */

type RevealDirection = "left" | "right" | "up" | "down";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const clipFrom = (dir: RevealDirection) => {
  switch (dir) {
    case "left": return "inset(0 100% 0 0)";
    case "right": return "inset(0 0 0 100%)";
    case "up": return "inset(100% 0 0 0)";
    case "down": return "inset(0 0 100% 0)";
  }
};

export function ScrollReveal({
  children,
  direction = "left",
  delay = 0,
  duration = 0.8,
  className,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: clipFrom(direction) }}
      animate={isInView ? { clipPath: "inset(0 0 0 0)" } : undefined}
      transition={{
        duration,
        delay,
        ease: EASE_OUT_QUINT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────
 * 4. ScrollStagger — stagger children on scroll
 * ──────────────────────────────────────────────────── */

interface ScrollStaggerProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  once?: boolean;
}

const staggerContainer: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: {
      staggerChildren: stagger,
    },
  }),
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_OUT_EXPO,
    },
  },
};

export function ScrollStagger({
  children,
  stagger = 0.1,
  delay = 0,
  className,
  once = true,
}: ScrollStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={stagger}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────
 * 5. ScrollParallax — depth parallax on scroll
 * ──────────────────────────────────────────────────── */

interface ScrollParallaxProps {
  children: ReactNode;
  speed?: number; // e.g. 0.15 = subtle, 0.4 = pronounced
  className?: string;
}

export function ScrollParallax({
  children,
  speed = 0.15,
  className,
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────
 * 6. ScrollCounter — animate a number counting up
 * ──────────────────────────────────────────────────── */

interface ScrollCounterProps {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function ScrollCounter({
  to,
  prefix = "",
  suffix = "",
  duration = 2,
  className,
}: ScrollCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useTransform(
    useScroll({ target: ref, offset: ["start end", "end center"] }).scrollYProgress,
    [0, 0.5],
    [0, to]
  );

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : undefined}
    >
      {prefix}
      <motion.span>
        {isInView ? (
          <CountUp to={to} duration={duration} />
        ) : (
          "0"
        )}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

function CountUp({ to, duration }: { to: number; duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      onAnimationStart={() => {
        if (!ref.current) return;
        const start = performance.now();
        const step = () => {
          const elapsed = performance.now() - start;
          const progress = Math.min(elapsed / (duration * 1000), 1);
          // ease-out-quint
          const eased = 1 - Math.pow(1 - progress, 5);
          const value = Math.round(eased * to);
          if (ref.current) ref.current.textContent = String(value);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }}
    >
      0
    </motion.span>
  );
}

/* ────────────────────────────────────────────────────
 * 7. ScrollDrawLine — SVG line-draw on scroll
 * ──────────────────────────────────────────────────── */

interface ScrollDrawLineProps {
  className?: string;
  orientation?: "vertical" | "horizontal";
  length?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export function ScrollDrawLine({
  className,
  orientation = "vertical",
  length = 200,
  strokeColor = "#2B5C4F",
  strokeWidth = 1,
}: ScrollDrawLineProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const isVert = orientation === "vertical";

  return (
    <svg
      ref={ref}
      className={className}
      width={isVert ? strokeWidth * 2 : length}
      height={isVert ? length : strokeWidth * 2}
      viewBox={`0 0 ${isVert ? strokeWidth * 2 : length} ${isVert ? length : strokeWidth * 2}`}
    >
      <motion.line
        x1={isVert ? strokeWidth : 0}
        y1={isVert ? 0 : strokeWidth}
        x2={isVert ? strokeWidth : length}
        y2={isVert ? length : strokeWidth}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.3 } : undefined}
        transition={{ duration: 1.2, ease: EASE_OUT_QUINT }}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────
 * 8. ScrollBlur — blur-in on scroll (glass reveal)
 * ──────────────────────────────────────────────────── */

interface ScrollBlurProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function ScrollBlur({
  children,
  delay = 0,
  duration = 0.8,
  className,
  once = true,
}: ScrollBlurProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
      animate={
        isInView
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : undefined
      }
      transition={{
        duration,
        delay,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────
 * 9. ScrollSection — full section with card rise effect
 * ──────────────────────────────────────────────────── */

interface ScrollSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScrollSection({
  children,
  delay = 0,
  className,
}: ScrollSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.08 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: 0.8,
        delay,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ────────────────────────────────────────────────────
 * 10. ScrollProgress — horizontal progress bar
 * ──────────────────────────────────────────────────── */

export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
      className={`fixed top-0 left-0 right-0 z-[100] h-[2px] bg-kestrel ${className ?? ""}`}
    />
  );
}

/* ────────────────────────────────────────────────────
 * 11. ScrollRotate — subtle rotation on scroll
 * ──────────────────────────────────────────────────── */

interface ScrollRotateProps {
  children: ReactNode;
  degrees?: number;
  className?: string;
}

export function ScrollRotate({
  children,
  degrees = 3,
  className,
}: ScrollRotateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [degrees, -degrees]);

  return (
    <motion.div ref={ref} style={{ rotate }} className={className}>
      {children}
    </motion.div>
  );
}
