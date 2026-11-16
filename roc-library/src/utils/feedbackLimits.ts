/** Length limits of a Feedback message. Shared by the form and the server, so it has no server-only imports. */
export const NAME_MAX = 50;
export const MESSAGE_MIN = 5;
export const MESSAGE_MAX = 1000;

/** A message as the dev's Feedback board shows it. */
export interface FeedbackRow {
  id: number;
  createdAt: string;
  name: string | null;
  message: string;
  /** when the dev ticked it as read; null while it is still unread */
  readAt: string | null;
}
