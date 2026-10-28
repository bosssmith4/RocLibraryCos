"use client";
import { createContext, useContext } from "react";

export const LOGO_SRC = "/assets/images/GuildImage/dog.jpg";
export const BANNER_SRC = "/assets/images/PatchTemplate/wantad.png";

/** Original image URL -> data URL. Empty on screen; filled for the export copy. */
type InlineMap = Record<string, string>;

const InlineImageContext = createContext<InlineMap>({});

export const InlineImageProvider = InlineImageContext.Provider;

/**
 * The URL an <img> should use. Inside an export copy the picture is already
 * embedded, so iOS Safari never has to fetch it while the PNG is being drawn.
 */
export const useInlineSrc = (src: string) => useContext(InlineImageContext)[src] ?? src;

const cache = new Map<string, Promise<string>>();

function fetchDataUrl(src: string): Promise<string> {
  let pending = cache.get(src);
  if (!pending) {
    pending = fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`image ${src} failed`);
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          }),
      );
    // A failed fetch must not be remembered, so the next press tries again.
    pending.catch(() => cache.delete(src));
    cache.set(src, pending);
  }
  return pending;
}

/** Embeds the logo, the banner and the item picture (the logo stands in if it is missing). */
export async function loadInlineImages(patchKey: string): Promise<InlineMap> {
  const itemSrc = `/assets/images/PatchImage/${patchKey}.bmp`;
  const [logo, banner, item] = await Promise.all([
    fetchDataUrl(LOGO_SRC),
    fetchDataUrl(BANNER_SRC),
    fetchDataUrl(itemSrc).catch(() => fetchDataUrl(LOGO_SRC)),
  ]);
  return { [LOGO_SRC]: logo, [BANNER_SRC]: banner, [itemSrc]: item };
}
