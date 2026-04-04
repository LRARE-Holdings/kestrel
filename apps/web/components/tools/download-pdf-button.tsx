"use client";

import { Button } from "@/components/ui/button";

interface DownloadPdfButtonProps {
  onClick: () => void;
  label?: string;
}

export function DownloadPdfButton({ onClick, label = "Download PDF" }: DownloadPdfButtonProps) {
  return (
    <Button onClick={onClick} variant="secondary" size="md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1.5"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {label}
    </Button>
  );
}
