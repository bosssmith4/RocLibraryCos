/**
 * A requirement as the data writes it. A part wrapped in {{ }} is a warning: it is shown in
 * brackets, in red and underlined, so a player does not miss it.
 */
export default function RequirementText({ text, warningOnOwnLine = false }: { text: string; warningOnOwnLine?: boolean }) {
  return (
    <>
      {text.split(/\{\{(.+?)\}\}/g).map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className={`text-error underline decoration-2 underline-offset-2 ${warningOnOwnLine ? "mt-1 block" : ""}`}
          >
            ({part})
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
