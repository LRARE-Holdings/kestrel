import Link from "next/link";

function KestrelMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left wing */}
      <path
        d="M0 28 Q8 0 28 6 L22 18 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right wing */}
      <path
        d="M56 28 Q48 0 28 6 L34 18 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Body */}
      <path
        d="M22 18 L28 6 L34 18 L28 42 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Tail */}
      <path
        d="M22 34 L28 42 L34 34"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const markSize = {
    sm: "h-6 w-auto",
    default: "h-8 w-auto",
    lg: "h-12 w-auto",
  }[size];

  const textSize = {
    sm: "text-lg",
    default: "text-[1.375rem]",
    lg: "text-3xl",
  }[size];

  const weight = {
    sm: "font-medium",
    default: "font-semibold",
    lg: "font-bold",
  }[size];

  return (
    <Link href="/" className="group flex items-center gap-2 text-kestrel transition-colors hover:text-kestrel-hover">
      <KestrelMark className={markSize} />
      <span className={`font-display ${textSize} ${weight} tracking-tight leading-none`}>
        Kestrel
      </span>
    </Link>
  );
}

export function LogoMark({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <Link href="/" className="text-kestrel transition-colors hover:text-kestrel-hover">
      <KestrelMark className={className} />
    </Link>
  );
}

export { KestrelMark };
