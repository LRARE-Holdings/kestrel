"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  ScrollFade,
  ScrollStagger,
  StaggerItem,
  ScrollBlur,
} from "@/components/ui/scroll-animations";

const tools = [
  {
    title: "Late Payment Toolkit",
    description:
      "Calculate statutory interest on overdue invoices and generate chaser letters under the Late Payment Act.",
    href: "/tools/late-payment",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "Contract Templates",
    description:
      "Freelancer agreements, service contracts, and more. Assembled from vetted clauses with optional dispute resolution built in.",
    href: "/tools/contracts",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    title: "Handshake",
    description:
      "Create a shareable agreement between two parties. Neither side needs to sign up. Confirm terms with a link.",
    href: "/tools/handshake",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    title: "Terms & Conditions",
    description:
      "Terms and conditions for your website or service. Customised to your business type, compliant with UK consumer law.",
    href: "/tools/terms",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Notice Log",
    description:
      "Keep a timestamped record of formal notices sent to clients or suppliers. Track delivery, content, and responses in one place.",
    href: "/tools/notice-log",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
  },
  {
    title: "Milestone Tracker",
    description:
      "Track milestones and deliverables against agreed timelines. Automatic breach flagging when deadlines pass.",
    href: "/tools/milestones",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
] as const;

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <ScrollBlur className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          Free Business Tools
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Tools for businesses in England and Wales. No sign-up required.
        </p>
      </ScrollBlur>

      {/* Tools grid */}
      <ScrollStagger stagger={0.08} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <StaggerItem key={tool.href}>
            <Link href={tool.href} className="group block h-full">
              <Card className="h-full transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:-translate-y-1 group-hover:border-kestrel/30">
                <CardContent className="flex flex-col gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-sage/15 text-kestrel">
                    {tool.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-ink group-hover:text-kestrel transition-colors">
                        {tool.title}
                      </h2>
                      <span className="rounded-full bg-sage/20 px-2 py-0.5 text-[10px] font-medium text-kestrel">
                        Live
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {tool.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </ScrollStagger>
    </div>
  );
}
