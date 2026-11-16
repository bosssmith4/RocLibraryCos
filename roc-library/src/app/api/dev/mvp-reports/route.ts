import { listBossReports, setBossReportFixed } from "@/utils/bossReportRecord";
import { devBoardApi } from "@/utils/devBoardApi";

/** Dev only: the MVP report board's reads and "fixed" ticks. */
export const dynamic = "force-dynamic";

const board = devBoardApi({ list: listBossReports, set: setBossReportFixed });
export const GET = board.GET;
export const PATCH = board.PATCH;
