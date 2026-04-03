interface IconProps {
  className?: string;
}

const defaultProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconHome({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z" />
      <path d="M9 21V14h6v7" />
    </svg>
  );
}

export function IconFileText({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}

export function IconScale({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M12 3v18" />
      <path d="M8 21h8" />
      <path d="M3 9l4-6h10l4 6" />
      <path d="M3 9a4 4 0 0 0 4 4 4 4 0 0 0 4-4" />
      <path d="M13 9a4 4 0 0 0 4 4 4 4 0 0 0 4-4" />
    </svg>
  );
}

export function IconWrench({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94L6.73 20.2a2 2 0 0 1-2.83 0l-.1-.1a2 2 0 0 1 0-2.83l6.83-6.73a6 6 0 0 1 7.94-7.94l-3.87 3.7z" />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function IconChevronLeft({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

export function IconLogOut({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function IconCalculator({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h2" />
      <path d="M14 14h2" />
      <path d="M8 18h2" />
      <path d="M14 18h2" />
    </svg>
  );
}

export function IconHandshake({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M11 17l-1.5 1.5a2.12 2.12 0 0 1-3 0 2.12 2.12 0 0 1 0-3L8 14" />
      <path d="M16 12.5L14.5 14a2.12 2.12 0 0 1-3 0 2.12 2.12 0 0 1 0-3l1-1" />
      <path d="M2 8l4-4 4.5 4.5" />
      <path d="M22 8l-4-4-4.5 4.5" />
      <path d="M2 8h4" />
      <path d="M18 8h4" />
      <path d="M6 8v10" />
      <path d="M18 8v10" />
    </svg>
  );
}

export function IconClipboard({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z" />
      <path d="M10 14l2 2 4-4" />
    </svg>
  );
}
