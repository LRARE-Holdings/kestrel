import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export default MarketingLayout;
