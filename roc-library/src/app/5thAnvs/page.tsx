import ChapterMap from "./components/ChapterMap";
import JourneyStrip from "./components/JourneyStrip";
import QuestTimeline from "./components/QuestTimeline";
import RecurringQuests from "./components/RecurringQuests";
import RewardsTeaser from "./components/RewardsTeaser";
import SectionHeading from "./components/SectionHeading";
import SourceRef from "./components/SourceRef";
import SectionNav from "./components/SectionNav";
import WarpPortals from "./components/WarpPortals";
import StoryGuide from "./components/StoryGuide";
import TitleBanner from "./components/TitleBanner";
import WorldFruitPlan from "./components/WorldFruitPlan";

/*
 * Held back for now, not deleted: Hero, InfoSections and Reveal. The Rewards live on
 * their own page, /5thAnvs/rewards (AnniversaryRewards and the components it uses).
 */
export default function FifthAnniversaryPage() {
  return (
    <main className="anvs mx-auto max-w-5xl space-y-16 px-4 py-6 sm:px-6">
      <TitleBanner />
      <SectionNav />
      <QuestTimeline />
      <section aria-labelledby="map-title" className="space-y-5">
        <SectionHeading index="01" title="แผนที่ Chapter" id="map-title" />
        <ChapterMap />
        <JourneyStrip />
        <SourceRef
          href="https://roc.gnjoy.in.th/event/all-server-5th-anniversary-story-quest/"
          title="5th Anniversary Story Quest"
        />
      </section>
      <RecurringQuests index="02" />
      <StoryGuide index="03" />
      <RewardsTeaser index="04" />
      <WorldFruitPlan index="05" />
      <WarpPortals index="06" />
    </main>
  );
}
