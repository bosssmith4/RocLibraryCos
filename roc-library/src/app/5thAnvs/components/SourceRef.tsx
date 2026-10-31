/** The official page a section's facts come from, as a small line at the section's foot. */
export default function SourceRef({ href, title }: { href: string; title: string }) {
  return (
    <p className="text-sm text-base-content/70">
      ที่มา:{" "}
      <a href={href} target="_blank" rel="noreferrer" className="underline">
        roc.gnjoy.in.th · {title}
      </a>
    </p>
  );
}
