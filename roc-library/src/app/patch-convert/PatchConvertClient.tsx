"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import { PageSkeleton } from "@/components/Loader";

import { useItemDb } from "@/services/patchData/itemsService";
import { PatchItemsDto } from "@/types/patch";
import * as htmlToImage from "html-to-image";
import ImageConvertPage from "./image-convert";
import ItemCard from "./ItemCard";
import { InlineImageProvider, loadInlineImages } from "./inlineImages";
import ItemPicker from "./ItemPicker";
import {
  CostumePreviewButton,
  CostumePreviewModal,
  useCostumeSprite,
} from "./CostumePreview";

/** Every exported PNG is laid out at this width, whatever device pressed the button. */
const EXPORT_WIDTH = 1024;

type ExportStatus = "idle" | "busy" | "done" | "error";

// decode() also waits until iOS has the pixels ready, which `complete` alone does not.
const waitForImages = (root: HTMLElement) =>
  Promise.all(
    Array.from(root.querySelectorAll("img")).map((img) =>
      img.complete && img.naturalWidth > 0
        ? img.decode().catch(() => undefined)
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  );

/** iPhone, iPad, and iPadOS, which reports itself as a Mac with a touch screen. */
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/**
 * iOS gets the share sheet (it has "Save Image"). Android's share sheet only lists apps
 * and has no way to save to the gallery, so Android and desktop download the file directly.
 * A share that iOS refuses also falls back to the download.
 * Only the file is shared: a title makes iOS "Copy" put the text on the clipboard, not the picture.
 */
async function deliverImage(file: File) {
  if (
    isIOS() &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      // Share refused (e.g. the tap's user activation expired): download instead.
    }
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.download = file.name;
  link.href = url;
  link.rel = "noopener";
  link.style.display = "none";
  // Android Chrome ignores a click on a link that is not in the page.
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Android hands the blob to its download manager later, so keep it for a while.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function ExportableItem({
  patchKey,
  item,
}: {
  patchKey: string;
  item: PatchItemsDto;
}) {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [exporting, setExporting] = useState(false);
  const [inlined, setInlined] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const canPreview = useCostumeSprite(patchKey, item.costume);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exporting) return;
    let cancelled = false;

    const run = async () => {
      try {
        const node = exportRef.current?.querySelector("article");
        if (!node) throw new Error("export card missing");

        await Promise.all([document.fonts.ready, waitForImages(node)]);

        const dataUrl = await htmlToImage.toPng(node, {
          backgroundColor: "transparent",
          pixelRatio: window.innerWidth < 768 ? 2 : 3,
          cacheBust: true,
        });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `item-${patchKey}.png`, {
          type: "image/png",
        });

        await deliverImage(file);
        if (!cancelled) setStatus("done");
      } catch {
        if (!cancelled) setStatus("error");
      } finally {
        if (!cancelled) setExporting(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [exporting, patchKey]);

  // Fetch the card's pictures ahead of time so the press has little left to wait for.
  useEffect(() => {
    loadInlineImages(patchKey).catch(() => undefined);
  }, [patchKey]);

  // The confirmation fades back to the normal button after a moment.
  useEffect(() => {
    if (status !== "done") return;
    const timer = setTimeout(() => setStatus("idle"), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  const startExport = async () => {
    setStatus("busy");
    try {
      // The export copy only mounts once every picture is embedded in it.
      setInlined(await loadInlineImages(patchKey));
      setExporting(true);
    } catch {
      setStatus("error");
    }
  };

  return (
    <section aria-labelledby={`item-title-${patchKey}`} className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-base-content/60">
            รหัส {patchKey}
            {item.costume && " · Costume"}
          </p>
          <h2
            id={`item-title-${patchKey}`}
            className="text-xl font-bold text-base-content sm:text-2xl"
          >
            {item.identifiedDisplayName}
          </h2>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            {canPreview && (
              <CostumePreviewButton onOpen={() => setPreviewOpen(true)} />
            )}
            <button
              type="button"
              onClick={startExport}
              disabled={status === "busy"}
              title="บันทึกการ์ดไอเทมเป็นรูป PNG"
              className={`btn min-h-11 flex-1 gap-2 sm:flex-none ${
                status === "done" ? "btn-success" : "btn-primary"
              }`}
            >
              {status === "busy" ? (
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
              ) : status === "done" ? (
                <Check aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Download aria-hidden="true" className="h-5 w-5" />
              )}
              {status === "busy"
                ? "กำลังสร้างภาพ..."
                : status === "done"
                  ? "บันทึกแล้ว"
                  : "ดาวน์โหลดรูป"}
            </button>
          </div>
          {/* Announces progress to screen readers without adding visible text. */}
          <span role="status" className="sr-only">
            {status === "busy" && "กำลังสร้างภาพ"}
            {status === "done" && "บันทึกรูปแล้ว"}
          </span>
          {status === "error" && (
            <span role="alert" className="text-sm text-error">
              สร้างภาพไม่สำเร็จ ลองกดดาวน์โหลดอีกครั้ง
            </span>
          )}
        </div>
      </div>

      {/* The board the card sits on: a quiet dot grid so the card is the only loud thing. */}
      <div className="rounded-box border border-base-300 bg-base-200 bg-[radial-gradient(color-mix(in_oklab,var(--color-base-content)_14%,transparent)_1px,transparent_1px)] bg-size-[18px_18px] p-3 sm:p-6">
        <ItemCard
          id={`item${patchKey}`}
          item={item}
          image={<ImageConvertPage patchKey={patchKey} />}
          showSponsor
        />
      </div>

      {canPreview && previewOpen && (
        <CostumePreviewModal
          patchKey={patchKey}
          name={item.identifiedDisplayName}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* Off-screen copy at a fixed width: only mounted while an export runs. */}
      {exporting && (
        <div
          ref={exportRef}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: -100000,
            width: EXPORT_WIDTH,
            pointerEvents: "none",
          }}
        >
          <InlineImageProvider value={inlined}>
            <ItemCard
              id={`export${patchKey}`}
              item={item}
              image={<ImageConvertPage patchKey={patchKey} />}
              showSponsor
            />
          </InlineImageProvider>
        </div>
      )}
    </section>
  );
}

export default function PatchConvertClient() {
  const { items, loading, error } = useItemDb();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>();

  const entries = Object.entries(items || {});
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? entries.filter(([, item]) =>
        item.identifiedDisplayName.toLowerCase().includes(needle),
      )
    : entries;
  // A search can hide the chosen item; fall back to the first match.
  const current = visible.find(([key]) => key === selected) ?? visible[0];

  if (loading) return <PageSkeleton cards={3} />;
  if (error) {
    return (
      <main className="px-4 py-6 sm:px-6">
        <div role="alert" className="alert alert-error mx-auto max-w-5xl">
          โหลดข้อมูลไอเทมไม่สำเร็จ: {error}
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 max-w-2xl">
          <h1 className="text-2xl font-bold text-base-content sm:text-3xl">
            Patch Convert
          </h1>
          <p className="mt-1 text-sm text-base-content/70">
            เลือกไอเทมจากแพตช์ แล้วกดดาวน์โหลดรูป เพื่อบันทึกการ์ดเป็น PNG
            สำหรับโพสต์
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <ItemPicker
            entries={visible}
            total={entries.length}
            selectedKey={current?.[0]}
            onSelect={setSelected}
            query={query}
            onQueryChange={setQuery}
          />

          {current ? (
            <ExportableItem
              key={current[0]}
              patchKey={current[0]}
              item={current[1]}
            />
          ) : (
            <p className="rounded-box border border-dashed border-base-300 p-10 text-center text-base-content/70">
              {entries.length === 0
                ? "ยังไม่มีข้อมูลไอเทมในแพตช์นี้"
                : "ไม่พบไอเทมที่ตรงกับคำค้นหา"}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
