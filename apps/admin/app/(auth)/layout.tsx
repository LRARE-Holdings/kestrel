export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-cream">
      <div className="w-full max-w-[400px] mx-4">
        {/* Kestrel Admin header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-ink tracking-tight">
            Kestrel Admin
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Internal management panel
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-surface rounded-xl border border-border p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
