import React, { useState } from "react";

/**
 * A whole-number box. It is a text input so the typed digits are ours to clean:
 * no leading zeros, and it may sit empty while typing (empty counts as the minimum).
 */
export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 9999,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  // What is being typed; null when the box is not being edited and just shows the value
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      className={className}
      value={draft ?? String(value)}
      onFocus={(event) => event.target.select()}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
        const typed = digits === "" ? 0 : Number(digits);
        setDraft(typed > max ? String(max) : digits);
        onChange(clamp(typed));
      }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        const next = clamp(value + (event.key === "ArrowUp" ? 1 : -1));
        setDraft(String(next));
        onChange(next);
      }}
      onBlur={() => setDraft(null)}
    />
  );
}

export function InputField({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
  suffix,
  hint,
  hideLabel,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  hint?: string;
  /** Keep the label for screen readers only (used when a row heading already names the field) */
  hideLabel?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={hideLabel ? "sr-only" : "text-sm font-bold"}>{label}</span>
      <span className="relative flex items-center">
        <NumberInput
          className={`input input-bordered w-full font-mono text-base font-bold ${suffix ? "pr-9" : ""}`}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
        />
        {suffix ? (
          <span className="absolute right-3 text-sm text-base-content/60">{suffix}</span>
        ) : null}
      </span>
      {hint ? <span className="text-xs leading-snug text-base-content/70">{hint}</span> : null}
    </label>
  );
}

/** One choice in a row of choices; the chosen one is filled. */
export function Chip({
  selected,
  onSelect,
  disabled,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`btn h-10 min-h-10 gap-1.5 px-3 text-sm ${
        selected
          ? "btn-primary"
          : "border-base-content/15 bg-base-100 font-normal hover:border-primary hover:bg-primary/10"
      }`}
    >
      {children}
    </button>
  );
}

/** A labelled row of Chips. */
export function ChipGroup({
  label,
  note,
  children,
}: {
  label: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-bold">
        {label}
        {note ? <span className="text-xs font-normal text-base-content/70">{note}</span> : null}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
