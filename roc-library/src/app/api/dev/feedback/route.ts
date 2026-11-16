import { devBoardApi } from "@/utils/devBoardApi";
import { listFeedback, setFeedbackRead } from "@/utils/feedbackRecord";

/** Dev only: the Feedback board's reads and "read" ticks. */
export const dynamic = "force-dynamic";

const board = devBoardApi({ list: listFeedback, set: setFeedbackRead });
export const GET = board.GET;
export const PATCH = board.PATCH;
