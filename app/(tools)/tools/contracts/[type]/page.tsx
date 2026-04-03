import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONTRACT_TYPES, isValidContractType } from "@/lib/contracts/schemas";
import { ContractForm } from "@/components/tools/contracts/contract-form";

type Params = { type: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { type } = await params;

  if (!isValidContractType(type)) {
    return { title: "Not Found — Kestrel" };
  }

  const config = CONTRACT_TYPES[type];
  return {
    title: `${config.title} — Contract Templates — Kestrel`,
    description: config.description,
  };
}

export function generateStaticParams() {
  return Object.keys(CONTRACT_TYPES).map((type) => ({ type }));
}

export default async function ContractTypePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { type } = await params;

  if (!isValidContractType(type)) {
    notFound();
  }

  return <ContractForm contractType={type} />;
}
