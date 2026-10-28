import type { Metadata } from "next";
import { isSignedIn } from "@/utils/botSession";
import { listKeys } from "@/utils/keyRecord";
import BotKeyGenerator from "./BotKeyGenerator";

// Not in any menu, and kept out of search engines. The sign-in modal is what really protects it.
export const metadata: Metadata = {
  title: "ตัวออกคีย์ Bot",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function BotGenerateKeyPage() {
  // The Key record is read on the server, and only for a signed-in visitor.
  const signedIn = await isSignedIn();
  const rows = signedIn ? await listKeys() : null;
  return <BotKeyGenerator signedIn={signedIn} rows={rows} />;
}
