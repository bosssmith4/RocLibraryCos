"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { parseGnd } from "@/utils/gndParser";
import { parseGat } from "@/utils/gatParser";
import { parseRsw } from "@/utils/rswParser";
import { createMapScene, type ColorMode, type MapScene } from "./mapScene";

interface MapViewerProps {
  /** Name of the map's files in public/assets/map/ (.gnd, .gat and .rsw), without extension. */
  name: string;
  title: string;
  /**
   * Embedded in a window: no page title, no walkable overlay and no edge switch, and the
   * viewer fills the height it is given.
   */
  embedded?: boolean;
  /** Cells of the map (the x and y the game shows) to pin. Keep the array the same between renders. */
  markers?: { x: number; y: number }[];
  /** Which pin the camera flies to; left out, the camera takes them all in. */
  focusIndex?: number;
  /** Shown instead of the error text when the map's files cannot be loaded. */
  errorContent?: ReactNode;
}

type Status = "loading" | "ready" | "error";

const MODES: { value: ColorMode; label: string }[] = [
  { value: "map", label: "แมพ (ดำ)" },
  { value: "texture", label: "พื้นผิวจริง" },
];

/** Ground pictures shared by every map; each map names its own under this folder. */
const TEXTURE_BASE = "/assets/sprite_data/texture";
/** Models (buildings, walls, trees...) shared by every map; the map's .rsw file names the ones it uses. */
const MODEL_BASE = "/assets/sprite_data/model";

async function fetchBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`โหลดไฟล์ไม่สำเร็จ (${response.status})`);
  return response.arrayBuffer();
}

export default function MapViewer({
  name,
  title,
  embedded = false,
  markers,
  focusIndex,
  errorContent,
}: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MapScene | null>(null);
  const markersRef = useRef({ markers, focusIndex });
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ColorMode>("map");
  const [showWalkable, setShowWalkable] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [hasMapLight, setHasMapLight] = useState(false);
  const [mapLight, setMapLight] = useState(true);
  const [textureCount, setTextureCount] = useState<number | null>(null);
  /** null while the buildings and objects load, then how many were placed */
  const [objectCount, setObjectCount] = useState<number | null>(null);

  useEffect(() => {
    markersRef.current = { markers, focusIndex };
    sceneRef.current?.setMarkers(markers ?? [], focusIndex);
  }, [markers, focusIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    const base = "/assets/map";

    (async () => {
      try {
        const [gndBuffer, gatBuffer, rsw] = await Promise.all([
          fetchBuffer(`${base}/${name}.gnd`),
          fetchBuffer(`${base}/${name}.gat`),
          // the objects are optional: a map without a readable .rsw still opens as terrain
          fetchBuffer(`${base}/${name}.rsw`).then(parseRsw).catch(() => null),
        ]);
        if (cancelled) return;
        const scene = createMapScene(
          container,
          parseGnd(gndBuffer),
          parseGat(gatBuffer),
          TEXTURE_BASE,
          rsw ? { rsw, modelBase: MODEL_BASE } : undefined,
        );
        sceneRef.current = scene;
        scene.setShowWalkable(!embedded);
        scene.setShowEdges(true);
        if (markersRef.current.markers) scene.setMarkers(markersRef.current.markers, markersRef.current.focusIndex);
        observer = new ResizeObserver(() => scene.resize());
        observer.observe(container);
        setHasMapLight(scene.hasMapLight);
        setStatus("ready");
        scene.objectsLoaded.then((count) => {
          if (!cancelled) setObjectCount(count);
        });
        scene.texturesLoaded.then((count) => {
          if (cancelled) return;
          setTextureCount(count);
          // Show the real ground pictures as soon as there are some.
          if (count > 0) {
            setMode("texture");
            scene.setMode("texture");
          }
        });
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "เปิดแมพไม่สำเร็จ");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [name, embedded]);

  const changeMode = (next: ColorMode) => {
    setMode(next);
    sceneRef.current?.setMode(next);
  };

  const toggleWalkable = (show: boolean) => {
    setShowWalkable(show);
    sceneRef.current?.setShowWalkable(show);
  };

  const toggleMapLight = (on: boolean) => {
    setMapLight(on);
    sceneRef.current?.setMapLight(on);
  };

  const toggleEdges = (show: boolean) => {
    setShowEdges(show);
    sceneRef.current?.setShowEdges(show);
  };

  return (
    <div
      className={
        embedded ? "flex h-full min-h-0 flex-col gap-3" : "mx-auto flex max-w-6xl flex-col gap-4 p-4"
      }
    >
      {!embedded && <h1 className="text-2xl font-bold">{title}</h1>}

      {status !== "error" && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="join">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                disabled={status !== "ready" || (m.value === "texture" && !textureCount)}
                className={`btn btn-sm join-item ${mode === m.value ? "btn-primary" : "btn-outline"}`}
                onClick={() => changeMode(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
          {hasMapLight && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={mapLight}
                disabled={status !== "ready"}
                onChange={(e) => toggleMapLight(e.target.checked)}
              />
              แสงตามแมพ
            </label>
          )}
          {!embedded && (
            <>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={showWalkable}
                  disabled={status !== "ready"}
                  onChange={(e) => toggleWalkable(e.target.checked)}
                />
                ช่องเดินได้
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={showEdges}
                  disabled={status !== "ready"}
                  onChange={(e) => toggleEdges(e.target.checked)}
                />
                เส้นขอบ
              </label>
            </>
          )}
        </div>
      )}

      {status === "ready" && textureCount !== 0 && objectCount === null && (
        <p className="text-sm text-base-content/60">กำลังโหลดตึกและวัตถุ...</p>
      )}

      {textureCount === 0 && (
        <p className="text-sm text-base-content/60">
          ยังไม่มีรูปพื้นผิวของแมพนี้ จึงเลือกโหมดพื้นผิวจริงไม่ได้
        </p>
      )}

      <div
        className={`relative overflow-hidden rounded-2xl border border-base-content/10 bg-base-300 ${
          embedded ? "min-h-64 flex-1" : "h-[70vh] min-h-96"
        }`}
      >
        <div ref={containerRef} className="h-full w-full touch-none" />
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            <span className="loading loading-spinner" aria-hidden="true" />
            กำลังโหลดแมพ...
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            {errorContent ?? <span className="text-error">{error}</span>}
          </div>
        )}
      </div>

      {status !== "error" && (
      <p className="text-xs text-base-content/60">
        ลาก = หมุน, ล้อเมาส์หรือถ่างนิ้ว = ซูม, ลากปุ่มขวาหรือสองนิ้ว = เลื่อน แสดงภูมิประเทศ ตึก กำแพง และต้นไม้แบบนิ่ง (ยังไม่มีน้ำ เอฟเฟกต์ และเสียง)
      </p>
      )}
    </div>
  );
}
