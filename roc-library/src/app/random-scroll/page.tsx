import Link from "next/link";
import ScrollRoller from "@/components/ScrollRoller";
import ScrollPicker from "@/components/ScrollRoller/ScrollPicker";
import { devToolsEnabled } from "@/data/commentDraw";
import { loadScrolls } from "@/data/scroll";

type RandomScrollPageProps = {
  searchParams: Promise<{ scroll?: string | string[] }>;
};

export default async function RandomScrollPage({
  searchParams,
}: RandomScrollPageProps) {
  const [scrolls, params] = await Promise.all([loadScrolls(), searchParams]);
  const requested = Array.isArray(params.scroll)
    ? params.scroll[0]
    : params.scroll;
  // An unknown id falls back to the first Scroll.
  const current = scrolls.find((s) => s.id === requested) ?? scrolls[0];

  return (
    <>
      {devToolsEnabled && (
        <div className="mx-auto w-full max-w-5xl px-4 pt-4 text-right">
          <Link className="btn btn-warning btn-xs" href="/random-scroll/facebook">
            [DEV] สุ่มจากคอมเมนต์ Facebook
          </Link>
        </div>
      )}
      <ScrollPicker scrolls={scrolls} currentId={current.id} />
      {/* The key remounts the roller, so a new Scroll starts with a clean history. */}
      <ScrollRoller key={current.id} title={current.title} prizes={current.prizes} />
    </>
  );
}
