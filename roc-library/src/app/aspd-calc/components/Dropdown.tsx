import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
  /** A short figure shown at the right of the row, e.g. a weapon factor */
  note?: string;
  /** Heading the option sits under; options of one group must be listed together */
  group?: string;
  /** A short figure shown at the right of the group heading, e.g. the group's Max ASPD */
  groupNote?: string;
}

/**
 * Scrolls only the list, never the page: a page that moves under a resting pointer
 * would hand the highlight to whichever option lands beneath it.
 */
function reveal(option: HTMLElement | null, headroom: number) {
  const list = option?.closest("ul");
  if (!option || !list) return;
  const top = option.offsetTop - headroom;
  const bottom = option.offsetTop + option.offsetHeight + 6;
  if (top < list.scrollTop) list.scrollTop = Math.max(0, top);
  else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
}

/** A select drawn by us, so it can carry group headings, figures and an opening animation. */
export function Dropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selected = options[selectedIndex];

  // Consecutive options of one group share a section, so its heading can stay in view while scrolling
  const sections: { group?: string; note?: string; start: number; items: DropdownOption<T>[] }[] = [];
  options.forEach((option, index) => {
    const last = sections[sections.length - 1];
    if (last && last.group === option.group) last.items.push(option);
    else sections.push({ group: option.group, note: option.groupNote, start: index, items: [option] });
  });

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const openList = () => {
    setActive(selectedIndex);
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
  };

  return (
    <div ref={root} className="relative flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-sm font-bold">
        {label}
      </span>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        className={`flex h-12 w-full items-center gap-2 rounded-xl border bg-base-100 px-3 text-left transition-[border-color,box-shadow] hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          open ? "border-primary ring-2 ring-primary/40" : "border-base-content/20"
        }`}
        onClick={() => (open ? setOpen(false) : openList())}
        onBlur={(event) => {
          if (!root.current?.contains(event.relatedTarget)) setOpen(false);
        }}
        onKeyDown={(event) => {
          if (!open) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
              event.preventDefault();
              openList();
            }
            return;
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            setActive((active + step + options.length) % options.length);
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            setActive(event.key === "Home" ? 0 : options.length - 1);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            choose(active);
          } else if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }}
      >
        <span id={`${id}-value`} className="min-w-0 flex-1 truncate font-bold">
          {selected?.label}
        </span>
        {selected?.note ? (
          <span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
            {selected.note}
          </span>
        ) : null}
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-primary transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="aspd-pop absolute inset-x-0 top-full z-30 mt-1.5 max-h-[min(28rem,65vh)] overflow-y-auto rounded-xl border border-primary/50 bg-base-100 shadow-xl"
        >
          {sections.map((section) => (
            <li key={section.start} role="presentation" className={`px-1.5 pb-1.5 ${section.group ? "" : "pt-1.5"}`}>
              {section.group ? (
                <div className="sticky top-0 z-10 -mx-1.5 mb-1 bg-base-100">
                  <p className="flex items-center justify-between gap-2 border-y border-primary/30 bg-primary/15 px-3 py-2 text-base font-bold text-primary">
                    <span className="min-w-0 truncate">{section.group}</span>
                    {section.note ? (
                      <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-bold text-accent-content">
                        {section.note}
                      </span>
                    ) : null}
                  </p>
                </div>
              ) : null}
              {section.items.map((option, offset) => {
                const index = section.start + offset;
                return (
                  <div
                    key={option.value}
                    id={`${id}-option-${index}`}
                    role="option"
                    aria-selected={index === selectedIndex}
                    ref={index === active ? (element) => reveal(element, section.group ? 48 : 6) : undefined}
                    className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg py-2 pr-2.5 text-sm ${
                      section.group ? "pl-6" : "pl-2.5"
                    } ${index === active ? "bg-primary/15" : ""} ${
                      index === selectedIndex ? "font-bold text-primary" : ""
                    }`}
                    onPointerEnter={() => setActive(index)}
                    // Keep focus on the button so the list does not close before the click lands
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => choose(index)}
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {option.note ? <span className="font-mono text-xs opacity-70">{option.note}</span> : null}
                    <Check
                      aria-hidden="true"
                      className={`size-4 shrink-0 ${index === selectedIndex ? "" : "invisible"}`}
                    />
                  </div>
                );
              })}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
