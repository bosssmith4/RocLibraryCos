import type { ElementMonster } from "@/types/monster";

/** The colour of each element's dot, as players picture them. Full class names so Tailwind sees them. */
const ELEMENT_DOT: Record<string, string> = {
  neutral: "bg-gray-400",
  water: "bg-blue-500",
  earth: "bg-amber-700",
  fire: "bg-red-500",
  wind: "bg-green-500",
  poison: "bg-purple-500",
  holy: "bg-yellow-400",
  shadow: "bg-slate-700",
  ghost: "bg-slate-200",
  undead: "bg-emerald-700",
};

/** A small coloured dot that says which element at a glance; the name always sits beside it. */
export function ElementDot({ element }: { element: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-base-content/30 ${
        ELEMENT_DOT[element.toLowerCase()] ?? "bg-gray-400"
      }`}
    />
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-field bg-base-200 px-2 py-1.5">
      <dt className="text-[11px] font-semibold text-base-content/60">{label}</dt>
      <dd className="text-sm font-bold tabular-nums">{value}</dd>
    </div>
  );
}

/**
 * Elements that are not 100%: above it the monster takes more damage, below it less,
 * and at 0% it takes none at all, which gets a group of its own.
 */
export function MonsterElementLists({ element }: { element: ElementMonster }) {
  const elements = Object.entries(element ?? {});

  return (
    <>
      <ElementList
        title="โดนธาตุแรงขึ้น"
        tone="text-success"
        items={elements.filter(([, v]) => v > 100)}
      />
      <ElementList
        title="ต้านทาน"
        tone="text-error"
        items={elements.filter(([, v]) => v < 100 && v !== 0)}
      />
      <ElementList
        title="ไม่โดน (0%)"
        tone="text-base-content"
        items={elements.filter(([, v]) => v === 0)}
      />
    </>
  );
}

function ElementList({
  title,
  tone,
  items,
}: {
  title: string;
  tone: string;
  items: [string, number][];
}) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) =>
    tone === "text-success" ? b[1] - a[1] : a[1] - b[1],
  );

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-base-content/60">{title}</p>
      <ul className="flex flex-wrap gap-1.5">
        {sorted.map(([element, value]) => (
          <li
            key={element}
            className="rounded-field border border-base-300 px-2 py-1 text-xs"
          >
            <span className="inline-flex items-center gap-1.5">
              <ElementDot element={element} />
              <span className="capitalize text-base-content/80">{element}</span>
              <span className={`font-bold tabular-nums ${tone}`}>{value}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
