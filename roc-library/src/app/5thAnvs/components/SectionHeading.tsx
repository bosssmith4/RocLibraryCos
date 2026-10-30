/** Poster-style heading of a page section: a big orange number, the title, an orange rule. */
export default function SectionHeading({
  index,
  title,
  id,
}: {
  index: string;
  title: string;
  id: string;
}) {
  return (
    <div className="flex items-center gap-4 border-b-4 border-(--anv-orange) pb-3">
      {index && (
        <span aria-hidden className="text-4xl font-black leading-none text-(--anv-orange)">
          {index}
        </span>
      )}
      <h2 id={id} className="scroll-mt-40 text-2xl font-extrabold">
        {title}
      </h2>
    </div>
  );
}
