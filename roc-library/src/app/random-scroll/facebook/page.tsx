import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { devToolsEnabled, listDraws, loadDraw } from "@/data/commentDraw";
import CommentDrawTool from "./CommentDrawTool";

// Dev only: not in any menu, and a production build answers 404.
export const metadata: Metadata = {
  title: "[DEV] สุ่มจากคอมเมนต์ Facebook",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ draw?: string | string[] }> };

export default async function CommentDrawPage({ searchParams }: Props) {
  if (!devToolsEnabled) notFound();
  const [draws, params] = await Promise.all([listDraws(), searchParams]);
  const requested = Array.isArray(params.draw) ? params.draw[0] : params.draw;
  const id = draws.find((d) => d.id === requested)?.id ?? draws[0]?.id ?? null;
  const file = id ? await loadDraw(id) : null;

  // The key starts the tool fresh when another draw is opened.
  return <CommentDrawTool key={id ?? "none"} draws={draws} id={id} initial={file} />;
}
