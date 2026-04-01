import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-cream">{children}</main>
      <Footer />
    </>
  );
}

export default ToolsLayout;
