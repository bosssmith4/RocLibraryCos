import { Handshake } from "lucide-react";

/**
 * "Allow Trade": this reward can be traded between players. Green, the one colour the page keeps
 * for "yes, allowed" (the quiz answers use it too), at the same small size as the exchange mark.
 */
export default function TradeTag() {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-success bg-success/10 py-0.5 pl-2 pr-2.5 text-xs font-black leading-none">
      <Handshake aria-hidden className="h-3.5 w-3.5 shrink-0 text-success" strokeWidth={2.5} />
       แลกเปลี่ยนได้
    </span>
  );
}
