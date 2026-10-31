import GuaranteeSlots from "./GuaranteeSlots";
import RewardsTeaser from "./RewardsTeaser";
import SectionHeading from "./SectionHeading";

/** Section 04: everything about getting the event's rewards, one block per way: the exchange and the Guarantee slots. */
export default function RewardExchange({ index }: { index: string }) {
  return (
    <section aria-labelledby="rewards-teaser-title" className="space-y-5">
      <SectionHeading index={index} title="Reward & Exchange" id="rewards-teaser-title" />
      <RewardsTeaser />
      <GuaranteeSlots />
    </section>
  );
}
