import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { GuaranteeServer } from "@/data/anniversary5thGuarantee";
import GuaranteeBrowser from "../components/GuaranteeBrowser";
import GuaranteeMachine from "../components/GuaranteeMachine";
import SectionHeading from "../components/SectionHeading";

export const metadata: Metadata = { title: "ตู้การันตี · 5th Anniversary" };

function BackLink() {
  return (
    <Link href="/5thAnvs" className="btn btn-sm w-fit gap-2">
      <ArrowLeft aria-hidden className="h-4 w-4" />
      กลับหน้าหลัก 5th Anniversary
    </Link>
  );
}

/** The Guarantee page: how the Coins and keys work, then each server's Garantee Gacha slots. */
export default async function FifthAnniversaryGuaranteePage({
  searchParams,
}: {
  searchParams: Promise<{ server?: string; v?: string }>;
}) {
  const { server, v } = await searchParams;
  const initialServer: GuaranteeServer = server === "moonlight" ? "moonlight" : "baphomet";
  return (
    <main className="anvs mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <BackLink />
      <SectionHeading index="" title="ตู้การันตี" id="guarantee-title" />
      <GuaranteeMachine />
      <GuaranteeBrowser initialServer={initialServer} initialVersion={Number(v) || 1} />
      <BackLink />
    </main>
  );
}
