import { getLatestBaseRate } from "@/lib/base-rate/queries";
import { LettersForm } from "@/components/tools/late-payment/letters-form";

export const metadata = {
  title: "Letter Generator — Late Payment Toolkit — Kestrel",
  description:
    "Generate late payment chasing letters in four escalating stages, from friendly reminder to notice of intent to commence proceedings.",
};

export default async function LettersPage() {
  const baseRate = await getLatestBaseRate();

  return <LettersForm baseRate={baseRate.rate} />;
}
