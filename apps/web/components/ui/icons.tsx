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

export function IconUpload({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function IconPaperclip({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export function IconSend({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function IconAlertTriangle({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function IconMessageSquare({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconDownload({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function IconCopy({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconExternalLink({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function IconFilter({ className }: IconProps) {
  return (
    <svg {...defaultProps} className={className}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
