/** Shared by the dev-only note boards (MVP reports, Feedback). No server-only imports, so pages can use it too. */
export const BOARD_PAGE_SIZE = 10;

/** "open" = not yet handled, "done" = ticked by the dev, "all" = both. */
export type BoardStatus = "open" | "done" | "all";

export interface BoardPage<T> {
  rows: T[];
  counts: Record<BoardStatus, number>;
  page: number;
  pages: number;
}

/** The boards, in the order their tabs appear. */
export const DEV_BOARDS = [
  { href: "/dev/mvp-reports", label: "รายงานข้อมูลบอส" },
  { href: "/dev/feedback", label: "ข้อความจากผู้เล่น" },
] as const;

/** Dev boards open only from this computer, even when the dev server is reachable from the network. */
export const onThisComputer = (host: string | null | undefined) =>
  /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host ?? "");
