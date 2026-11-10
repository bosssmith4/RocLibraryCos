import { headers } from "next/headers";
import PatchConvertClient from "./PatchConvertClient";

type PatchConvertPageProps = {
  searchParams: Promise<{ Key?: string | string[] }>;
};

export default async function PatchConvertPage({
  searchParams,
}: PatchConvertPageProps) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host")?.split(":")[0].toLowerCase();
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const params = await searchParams;
  const patchMember = Array.isArray(params.Key)
    ? params.Key[0]
    : params.Key;
    
  const allowedKeys = "1e93f651-1cf5-453c-8f0b-674c4e916942";

  if (
    !isLocalhost &&
    (!allowedKeys || patchMember !== allowedKeys)
  ) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-error">Access denied</h1>
          <p className="mt-2 text-base-content/70">
            เปิดหน้านี้ด้วย parameter ที่ถูกต้อง
            <br/>
            ติดตามข้อมูลเพิ่มเติมได้ที่
            <a href="https://www.facebook.com/profile.php?id=61579020425764" target="_blank" className="text-primary underline m-2">
              FB: หมากัดหมวด
            </a>
            ประจำวันพุธ เวลา 06:00 เป็นต้นไป
          </p>
        </div>
      </main>
    );
  }

  return <PatchConvertClient />;
}
