/**
 * Reads one Facebook Page post and its comments through the Graph API. Server only: it needs
 * FB_PAGE_ACCESS_TOKEN, a Page access token for the Page that owns the post (Facebook does not
 * say who wrote a comment, only whether the Page did). FB_PAGE_ID lets a bare post number be used.
 */
const GRAPH = "https://graph.facebook.com/v27.0";
const MAX_PAGES = 200; // 100 comments a page, so at most 20,000 comments

export interface FacebookComment {
  id: string;
  message: string;
  createdTime: string;
  /** Missing when Facebook does not reveal the writer. */
  from?: { id: string; name: string };
}

export interface FacebookPost {
  /** Graph id, "<page id>_<post id>". */
  id: string;
  message: string;
  permalink?: string;
  comments: FacebookComment[];
}

/**
 * Turns what the user pasted into a Graph post id. Accepts "<page id>_<post id>", a bare post
 * number (with FB_PAGE_ID set), or a link holding the numbers. "pfbid..." links cannot be read.
 */
export function parsePostId(input: string, pageId = process.env.FB_PAGE_ID?.trim()): string {
  const value = input.trim();
  if (/^\d+_\d+$/.test(value)) return value;

  const withPage = (post: string, page = pageId) => {
    if (!page) {
      throw new Error("ใส่เป็น <page id>_<post id> หรือตั้ง FB_PAGE_ID ใน environment/.env.local");
    }
    return `${page}_${post}`;
  };
  if (/^\d+$/.test(value)) return withPage(value);

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("อ่าน Post id ไม่ออก: ใส่ลิงก์โพสต์ หรือ <page id>_<post id>");
  }
  const story = url.searchParams.get("story_fbid");
  if (story && /^\d+$/.test(story)) return withPage(story, url.searchParams.get("id") ?? pageId);
  const fbid = url.searchParams.get("fbid");
  if (fbid && /^\d+$/.test(fbid)) return withPage(fbid);
  const fromPath = url.pathname.match(/\/(?:posts|videos|photos)\/(?:[^/]+\/)?(\d+)/);
  if (fromPath) return withPage(fromPath[1]);

  throw new Error(
    "ลิงก์นี้ไม่มีเลขโพสต์ (ลิงก์แบบ pfbid อ่านไม่ได้): เปิดโพสต์ > ... > ฝังโพสต์ หรือคัดลอกเลขจาก Meta Business Suite",
  );
}

async function graph<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Facebook ตอบกลับว่า: ${message}`);
  }
  return body as T;
}

interface RawComment {
  id: string;
  message?: string;
  created_time: string;
  from?: { id: string; name: string };
}

/** Fetches the post and every top-level comment, oldest first. Replies are left out. */
export async function fetchPostComments(postId: string): Promise<FacebookPost> {
  const token = process.env.FB_PAGE_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("ยังไม่ได้ตั้ง FB_PAGE_ACCESS_TOKEN ใน environment/.env.local");
  const auth = `access_token=${encodeURIComponent(token)}`;

  const post = await graph<{ id: string; message?: string; permalink_url?: string }>(
    `${GRAPH}/${postId}?fields=id,message,permalink_url&${auth}`,
  );

  const comments: FacebookComment[] = [];
  let next: string | undefined =
    `${GRAPH}/${postId}/comments?fields=id,message,created_time,from` +
    `&filter=toplevel&order=chronological&limit=100&${auth}`;
  for (let page = 0; next && page < MAX_PAGES; page++) {
    const body: { data: RawComment[]; paging?: { next?: string } } = await graph(next);
    for (const c of body.data) {
      comments.push({
        id: c.id,
        message: c.message ?? "",
        createdTime: c.created_time,
        ...(c.from ? { from: c.from } : {}),
      });
    }
    next = body.paging?.next;
  }

  return {
    id: post.id,
    message: post.message ?? "",
    ...(post.permalink_url ? { permalink: post.permalink_url } : {}),
    comments,
  };
}
