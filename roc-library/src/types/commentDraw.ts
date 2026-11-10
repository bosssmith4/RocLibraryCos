export type Server = "Baphomet" | "Moonlight";

/** What the developer typed over what was read from a comment. Only the fields they changed are kept. */
export interface EntrantEdit {
  facebookName?: string;
  characterName?: string;
  cCode?: string;
  server?: Server;
}

/** One top-level comment of the post, as fetched, plus what the developer added to it. */
export interface DrawComment {
  id: string;
  message: string;
  createdTime: string;
  /** Written by the Page itself; never an Entrant. */
  fromPage?: boolean;
  /** From the comments the developer pasted out of Facebook. */
  facebookName?: string;
  edit?: EntrantEdit;
  /** The developer's review: count it, or leave it out. Unset means the rules decide. */
  review?: "count" | "skip";
}

/** A Winner, copied at draw time so it survives the comment being edited or deleted later. */
export interface DrawWinner {
  commentId: string;
  award: string;
  at: string;
  facebookName: string;
  characterName: string;
  cCode: string;
  server: Server;
}

/** One Comment draw, saved as dev-data/comment-draw/<id>.json. */
export interface CommentDrawFile {
  postId: string;
  title: string;
  source?: string;
  fetchedAt: string;
  comments: DrawComment[];
  winners: DrawWinner[];
}

export type HeldReason =
  | "no-code"
  | "no-server"
  | "no-facebook-name"
  | "duplicate-code"
  | "duplicate-name";

/** A comment with its fields read and the rules applied. */
export interface ReadComment {
  comment: DrawComment;
  facebookName: string;
  characterName: string;
  cCode: string;
  server?: Server;
  reasons: HeldReason[];
  /** For a repeat: the earlier comment with the same C-Code or Facebook name. */
  firstId?: string;
  /** True when it is an Entrant: either nothing is wrong, or the developer counted it. */
  counts: boolean;
}

export interface Entrant {
  commentId: string;
  facebookName: string;
  characterName: string;
  cCode: string;
  server: Server;
}
