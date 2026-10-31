"use client";
import { useState } from "react";
import { Check, KeyRound, Search, X } from "lucide-react";
import { PageSkeleton } from "@/components/Loader";
import SpritePlayer from "@/components/SpritePlayer/SpritePlayer";
import {
  GUARANTEE_ITEMS,
  GUARANTEE_SLOTS,
  SLOT_SPRITE,
  slotName,
  type GuaranteeServer,
} from "@/data/anniversary5thGuarantee";
import { guaranteeImage, rewardLabel, useGuaranteeItems } from "@/services/anniversary/anniversaryService";
import ItemCard from "../../patch-convert/ItemCard";
import { KEY_TONE } from "./keyTone";

/** Server tabs, then that server's Garantee Gacha slots; the chosen slot shows its machine and its items. */
export default function GuaranteeBrowser({
  initialServer,
  initialVersion,
}: {
  initialServer: GuaranteeServer;
  initialVersion: number;
}) {
  const [server, setServer] = useState(initialServer);
  const group = GUARANTEE_SLOTS.find((g) => g.server === server)!;
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [only, setOnly] = useState<"all" | "gold" | "silver">("all");
  const { items, loading, error } = useGuaranteeItems();
  const [version, setVersion] = useState(
    group.versions.includes(initialVersion) ? initialVersion : group.versions[0],
  );

  const slotItems = GUARANTEE_ITEMS[`${server}-${version}`];
  const openItem = openId ? items[openId] : undefined;
  const needle = query.trim().toLowerCase();
  const matches = (id: number) =>
    !needle || (items[String(id)]?.identifiedDisplayName ?? "").toLowerCase().includes(needle);
  const tiers = [
    { id: "gold" as const, key: "Anniver Gold Key77", grade: "SS", coins: 500, ids: slotItems?.gold ?? [] },
    { id: "silver" as const, key: "Anniver Silver Key77", grade: "S", coins: 250, ids: slotItems?.silver ?? [] },
  ];

  const visibleTiers = tiers.filter((t) => only === "all" || only === t.id);
  // an item that two groups share is counted once
  const shownCount = new Set(visibleTiers.flatMap((t) => t.ids.filter(matches))).size;

  const switchServer = (next: GuaranteeServer) => {
    setServer(next);
    setVersion(1);
    setQuery("");
    setOnly("all");
  };

  return (
    <div className="space-y-6 rounded-3xl bg-(--anv-orange)/10 p-4 sm:p-6">
      <div className="space-y-2">
        <p className="text-center text-sm font-bold text-base-content/70">เลือกเซิร์ฟเวอร์ที่เล่น</p>
        <div
          role="tablist"
          aria-label="เซิร์ฟเวอร์"
          className="mx-auto grid max-w-md grid-cols-2 gap-1 rounded-full border-2 border-(--anv-orange) bg-base-100 p-1 shadow-md"
        >
          {GUARANTEE_SLOTS.map((g) => {
            const selected = server === g.server;
            return (
              <button
                key={g.server}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => switchServer(g.server)}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-lg font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--anv-orange) ${
                  selected ? "bg-(--anv-orange) text-(--anv-ink)" : "text-base-content hover:bg-(--anv-orange)/20"
                }`}
              >
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-current"
                >
                  {selected && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      <div role="group" aria-label="เลือกตู้" className="flex flex-wrap justify-center gap-2">
        {group.versions.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={version === v}
            onClick={() => {
              setVersion(v);
              setQuery("");
              setOnly("all");
            }}
            className={`btn btn-sm ${version === v ? "border-0 bg-(--anv-orange) text-(--anv-ink)" : "btn-outline"}`}
          >
            V.{v}
          </button>
        ))}
      </div>

      <div key={`${server}-${version}`} className="anvs-fade space-y-4 rounded-2xl bg-base-100 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <SpritePlayer src={SLOT_SPRITE} size={140} label={`${slotName(version)} (${group.name})`} />
          <div className="leading-tight">
            <h3 className="text-2xl font-black">{slotName(version)}</h3>
            <p className="font-bold text-base-content/70">{group.name}</p>
          </div>
        </div>
        {slotItems && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex h-12 min-w-0 flex-1 basis-64 items-center gap-2 rounded-full border-2 border-(--anv-orange) bg-base-100 py-1 pl-1 pr-3 shadow-md transition-shadow focus-within:shadow-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--anv-orange)">
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--anv-orange) text-(--anv-ink)"
              >
                <Search className="h-5 w-5" strokeWidth={3} />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาไอเท็มในตู้นี้ เช่น Wing, Ring"
                aria-label="ค้นหาไอเท็มในตู้นี้"
                className="min-w-0 flex-1 bg-transparent text-base font-bold text-base-content outline-none placeholder:font-semibold placeholder:text-base-content/50 [&::-webkit-search-cancel-button]:appearance-none"
              />
              {needle && (
                <span className="shrink-0 rounded-full bg-base-200 px-2.5 py-0.5 text-sm font-black">
                  พบ {shownCount}
                </span>
              )}
              {query && (
                <button
                  type="button"
                  aria-label="ล้างคำค้นหา"
                  onClick={() => setQuery("")}
                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-(--anv-orange)"
                >
                  <X aria-hidden className="h-4 w-4" strokeWidth={3} />
                </button>
              )}
            </label>
            <div role="group" aria-label="เลือก Key" className="flex gap-1 rounded-full border-2 border-base-300 bg-base-100 p-1">
              {(
                [
                  { id: "all", label: "ทั้งหมด", on: "bg-(--anv-ink) text-(--anv-cream)" },
                  { id: "gold", label: "Gold · SS", on: KEY_TONE.gold.solid },
                  { id: "silver", label: "Silver · S", on: KEY_TONE.silver.solid },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={only === f.id}
                  onClick={() => setOnly(f.id)}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--anv-orange) ${
                    only === f.id ? f.on : "hover:bg-base-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {loading && <PageSkeleton cards={3} />}
        {error && (
          <p role="alert" className="rounded-box bg-base-200 p-4 text-error">
            โหลดข้อมูลไอเท็มไม่สำเร็จ: {error}
          </p>
        )}
        {!loading && !error && !slotItems && (
          <p className="rounded-xl bg-base-200 px-4 py-6 text-center font-bold text-base-content/70">
            กำลังรวบรวมข้อมูลไอเท็มของตู้นี้
          </p>
        )}
        {!loading &&
          !error &&
          slotItems &&
          visibleTiers.map((tier) => (
            <section
              key={tier.id}
              aria-label={`${tier.key} ระดับ ${tier.grade}`}
              className={`overflow-hidden rounded-2xl border-2 ${KEY_TONE[tier.id].border} ${KEY_TONE[tier.id].soft}`}
            >
              <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 ${KEY_TONE[tier.id].solid}`}>
                <KeyRound aria-hidden className="h-8 w-8 shrink-0" />
                <h4 className="text-xl font-black leading-tight">{tier.key}</h4>
                <span className="rounded-full bg-base-100 px-3 py-0.5 font-black text-base-content">
                  ระดับ {tier.grade}
                </span>
                <span className="ml-auto text-sm font-bold">
                  ใช้ {tier.coins} Coin · เลือก 1 ชิ้นจาก{" "}
                  {needle ? `${tier.ids.filter(matches).length} / ${tier.ids.length}` : tier.ids.length} ชิ้น
                </span>
              </div>
              <ul className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-5">
                {tier.ids.filter(matches).map((id) => {
                  const item = items[String(id)];
                  if (!item) return null;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(String(id))}
                        aria-label={`ดูรายละเอียด ${item.identifiedDisplayName}`}
                        className={`flex h-full w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-base-100 p-3 text-center transition-all hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--anv-orange) ${
                          tier.id === "gold" ? "hover:border-(--key-gold)" : "hover:border-(--key-silver)"
                        }`}
                      >
                        <span className={`flex h-20 w-20 items-center justify-center rounded-lg ${KEY_TONE[tier.id].soft}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={guaranteeImage(id)}
                            alt=""
                            className="h-14 w-14 object-contain drop-shadow"
                            onError={(e) => {
                              e.currentTarget.style.visibility = "hidden";
                            }}
                          />
                        </span>
                        <span className="text-sm font-bold leading-snug">{rewardLabel(item)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {needle && !tier.ids.some(matches) && (
                <p className="px-4 pb-4 text-center font-bold text-base-content/70">ไม่พบไอเท็มที่ค้นหา</p>
              )}
            </section>
          ))}
      </div>

      {openId && openItem && (
        <dialog open className="modal modal-open" onClick={() => setOpenId(null)}>
          <div className="modal-box max-w-5xl bg-transparent p-0 shadow-none" onClick={(e) => e.stopPropagation()}>
            <ItemCard
              id={`guarantee-${openId}`}
              item={openItem}
              image={
                <div className="image-item flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="rounded-xl"
                    src={guaranteeImage(openId)}
                    alt={`ภาพไอเทมรหัส ${openId}`}
                    width={150}
                    height={300}
                  />
                </div>
              }
            />
            <div className="mt-3 text-center">
              <button type="button" className="btn" onClick={() => setOpenId(null)}>
                ปิด
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
