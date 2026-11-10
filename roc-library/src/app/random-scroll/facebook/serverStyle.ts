import type { Server } from "@/types/commentDraw";

/** Every Entrant card takes its server's colour: Baphomet blue, Moonlight yellow. */
export const SERVER_STYLE: Record<Server, { card: string; badge: string }> = {
  Baphomet: { card: "border-info bg-info/15", badge: "badge-info" },
  Moonlight: { card: "border-warning bg-warning/20", badge: "badge-warning" },
};
