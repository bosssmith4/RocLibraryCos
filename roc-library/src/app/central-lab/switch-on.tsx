const PANEL_IMAGE = "/assets/images/Cenlab/example_switchOn.png";
const TUBE_TOP = 43;
const TUBE_BOTTOM = 116;

/** Where each lamp's tube runs in the panel picture (908 × 510), left to right; they lean with the camera. */
const LAMPS = [
  { top: 33, bottom: 41, duration: 2.3, delay: -0.4 },
  { top: 139, bottom: 144, duration: 3.1, delay: -3.1 },
  { top: 244.5, bottom: 246, duration: 2, delay: -1.7 },
  { top: 348.5, bottom: 350, duration: 3.5, delay: -5.2 },
  { top: 561, bottom: 554.5, duration: 2.7, delay: -2.6 },
  { top: 666, bottom: 659.5, duration: 2.9, delay: -4.4 },
  { top: 770, bottom: 762, duration: 2.1, delay: -0.9 },
  { top: 876, bottom: 867, duration: 3.3, delay: -3.8 },
];

interface LightCodePanelProps {
  /** The Light code as 8 bits; spaces are ignored. */
  binary: string;
}

export default function LightCodePanel({ binary }: LightCodePanelProps) {
  const bits = binary.replace(/\s/g, "");

  return (
    <div
      role="img"
      aria-label={`ไฟที่ติดตามรหัส ${binary}`}
      className="relative aspect-908/510 w-full overflow-hidden rounded-box bg-cover bg-center"
      style={{ backgroundImage: `url('${PANEL_IMAGE}')` }}
    >
      <svg
        viewBox="0 0 908 510"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="cenlab-lamp-halo">
            <stop offset="0" stopColor="#ffe066" stopOpacity="0.85" />
            <stop offset="0.45" stopColor="#ffc61a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ffc61a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {LAMPS.map((lamp, index) =>
          bits[index] === "1" ? <LitLamp key={index} {...lamp} /> : null,
        )}
      </svg>
    </div>
  );
}

function LitLamp({ top, bottom, duration, delay }: (typeof LAMPS)[number]) {
  const timing = {
    "--lamp-duration": `${duration}s`,
    "--lamp-delay": `${delay}s`,
  } as React.CSSProperties;

  return (
    <g style={timing}>
      <ellipse
        className="cenlab-lamp-halo"
        cx={(top + bottom) / 2}
        cy={(TUBE_TOP + TUBE_BOTTOM) / 2}
        rx={62}
        ry={74}
        fill="url(#cenlab-lamp-halo)"
      />
      <g className="cenlab-lamp-core" strokeLinecap="round">
        <line x1={top} y1={TUBE_TOP} x2={bottom} y2={TUBE_BOTTOM} stroke="#ffd84d" strokeOpacity={0.7} strokeWidth={9} />
        <line x1={top} y1={TUBE_TOP} x2={bottom} y2={TUBE_BOTTOM} stroke="#fff8d6" strokeWidth={4} />
        <circle cx={top} cy={TUBE_TOP} r={7} fill="#fff3b0" />
        <circle cx={bottom} cy={TUBE_BOTTOM} r={7} fill="#fff3b0" />
      </g>
    </g>
  );
}

/** The Light code as a row of lamps, filled when lit and hollow when dark, in its two groups of 4. */
export function LampBits({ binary }: { binary: string }) {
  return (
    <div aria-hidden="true" className="flex gap-3">
      {binary.split(" ").map((group, groupIndex) => (
        <div key={groupIndex} className="flex gap-1.5">
          {group.split("").map((bit, index) => (
            <span
              key={index}
              className={`h-10 w-5 rounded-full border-2 lg:w-6 ${
                bit === "1"
                  ? "border-accent bg-accent shadow-[0_0_10px_var(--color-accent)]"
                  : "border-base-content/25 bg-transparent"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CodeReadoutProps {
  code: string;
  binary: string;
}

/** The two forms of one day's code: the number to enter and the lamps to light. */
export function CodeReadout({ code, binary }: CodeReadoutProps) {
  return (
    <dl className="flex h-full flex-col justify-center gap-6 rounded-box border border-base-300 bg-base-100 p-5">
      <div>
        <dt className="text-sm font-semibold text-base-content/70">รหัสเข้า (Entry code)</dt>
        <dd className="mt-1 text-7xl font-extrabold leading-none tabular-nums text-primary lg:text-8xl">{code}</dd>
      </div>
      <div>
        <dt className="mb-2 text-sm font-semibold text-base-content/70">ไฟที่ต้องเปิด (Light code)</dt>
        <dd>
          <LampBits binary={binary} />
          <p className="mt-2 text-sm tabular-nums text-base-content/70">{binary}</p>
        </dd>
      </div>
    </dl>
  );
}
