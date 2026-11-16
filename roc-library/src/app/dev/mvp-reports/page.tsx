import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { devToolsEnabled } from "@/data/commentDraw";
import { onThisComputer } from "@/utils/devBoard";
import MvpReportBoard from "./MvpReportBoard";

// Dev only: not in any menu, and a production build, or any address but this computer, gets 404.
export const metadata: Metadata = {
  title: "[DEV] รายงานข้อมูลบอส",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function MvpReportsPage() {
  if (!devToolsEnabled || !onThisComputer((await headers()).get("host"))) notFound();
  return <MvpReportBoard />;
}
