export type AnniversaryServer = "baphomet" | "moonlight";

/** Reward type: which kind of equipment an Anniversary reward is. */
export type AnniversaryRewardType = "headGear" | "accessory";

/** One card inside an Event info section: a town's Chapter, or a Quest type. */
export interface AnniversaryInfoEntry {
  /** town or quest name */
  title: string;
  /** Chapter number in Roman numerals, e.g. "II" */
  numeral?: string;
  /** English Chapter name, e.g. "Foundation" */
  subtitle?: string;
  /** Thai Chapter name, shown in quotation marks */
  heading?: string;
  /** lines of detail; leave empty until the content is known */
  detail?: string[];
  /** the closing line of a Chapter, shown in italics */
  tagline?: string;
  /** the Chapter's picture is not revealed yet, so a "?" box stands in */
  mystery?: boolean;
  /** a picture of the Chapter's key reward; when set it replaces the "?" box and the town emblem */
  art?: { src: string; alt: string };
  /** the Chapter's logo, shown in the quest window header and wherever the Chapter is named; every Chapter has one */
  logo?: { src: string; alt: string };
}

/** A section of the 5th Anniversary page that explains part of the event. */
export interface AnniversaryInfoSection {
  /** anchor id, also used by the links in the hero */
  id: string;
  title: string;
  summary?: string;
  /**
   * route: stops along a zigzag path, one card per stop (the Chapters);
   * tiles: a few big coloured cards.
   */
  layout: "route" | "tiles";
  entries: AnniversaryInfoEntry[];
}

export type QuestTaskKind = "kill" | "collect" | "quiz" | "find" | "reward";

/** What a reward can be turned into, e.g. Black Soul into World Fruit at 1 : 1. */
export interface QuestTaskExchange {
  /** the target item, e.g. "World Fruit" */
  label: string;
  /** how much of the target one of this gives, e.g. "1 : 1" */
  rate: string;
  /** the target item's picture, like itemImageId */
  itemImageId?: string | number;
}

/** One thing a quest asks the player to do. */
export interface QuestTask {
  kind: QuestTaskKind;
  /** what to kill, collect or do, e.g. "Firewood" */
  label: string;
  count?: number;
  /** unit of the count, e.g. "ชิ้น" or "ตัว" */
  unit?: string;
  /** where it comes from, e.g. "จากการสังหาร Savage [Event]" */
  via?: string;
  /** monster whose picture shows beside the task: its id in monsterDb (an [Event] monster uses the normal one's picture) */
  monsterId?: number;
  /** the item's id: its picture is public/assets/images/anvs/items/<itemImageId>.bmp */
  itemImageId?: string | number;
  /** the reward can be exchanged for something else; shown as a small mark under it */
  exchange?: QuestTaskExchange;
  /** the reward can be traded between players; shown as an "Allow Trade" mark */
  tradable?: boolean;
  /** small extra lines under the task, e.g. what an item can and cannot do */
  details?: string[];
  /** remarks that must not be missed, shown as bold pills, e.g. the days a monster appears */
  badges?: string[];
}

/** One step of the server-wide goal of the World Event. */
export interface WorldMilestone {
  /** the mission's name, e.g. "การจุติใหม่" */
  name: string;
  nameEn: string;
  /** how many Dragon Cataclysm quests the whole server must hand in */
  target: number;
  /** what every player gets when the target is reached */
  reward: QuestTask;
}

/** A small box of facts, e.g. the buffs a reward gives and what they cost. */
export interface InfoPanel {
  title: string;
  chips?: string[];
  facts?: { label: string; value: string }[];
}

/** The quest of one Chapter, shown in the panel under the map. */
export interface ChapterQuest {
  /** matches the Chapter entry's `title` */
  town: string;
  /** the quest's name in the game */
  gameTitle: string;
  /** short label of what kind of quest it is, e.g. "สังหาร" */
  kind: string;
  intro?: string;
  /** what the character needs before it can accept the quest, e.g. "LV 99+" */
  requirements?: string[];
  /** where to go and whom to talk to, in order; a coordinate in the text becomes a link */
  steps?: string[];
  tasks: QuestTask[];
  /** the correct answers of a quiz Chapter, in the order the questions come */
  quizAnswers?: string[];
  /** what the quest gives; items are shown like the rewards of the World Quest */
  rewards?: QuestTask[];
  /** the closing instruction, e.g. to report back */
  outro?: string;
  notes?: string[];
  /** map coordinates to visit, e.g. "prt_q 87 339" */
  coordinates?: string[];
}

export interface RecurringQuest {
  title: string;
  tasks: QuestTask[];
  milestones?: WorldMilestone[];
  panels?: InfoPanel[];
  /** conditions and remarks of the quest */
  notes?: string[];
}

/** Daily, Weekly or World quests of the event. */
export interface RecurringQuestGroup {
  id: "daily" | "weekly" | "world";
  title: string;
  note?: string;
  quests: RecurringQuest[];
  /** what each finished quest of the group gives, shown once under the quests */
  rewards?: QuestTask[];
  /** where the NPC who gives the quests stands, e.g. "prt_q 156 195"; a coordinate becomes a map link */
  acceptAt?: string;
  /** the Chapter (1 to 6) that must be finished before the quests can be taken */
  requiresChapter?: number;
  /** how often the rewards come, e.g. "ได้รับ 1 ครั้ง ต่อเควส" */
  rewardNote?: string;
}

/** One job-change stop: the class to become, where the NPC stands. */
export interface JobChangeStop {
  job: string;
  place: string;
}

/** Facts of the Story Quest that cut across Chapters, shown under the map. */
export interface StoryGuide {
  /** the event period, written out for the page */
  period: string;
  /** things to know before starting, e.g. the Marin form */
  notes: string[];
  /** steps after Chapter II: Hi Novice, then Hi Class */
  hiNovice: JobChangeStop[];
  hiClass: string[];
  /** equipment sets given by the Chapters and what they cost to improve */
  equipment: { name: string; from: string; detail: string }[];
}
