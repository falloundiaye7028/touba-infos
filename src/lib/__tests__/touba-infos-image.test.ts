import { describe, expect, it } from "vitest";
import { editorialImageSrc, focalPosition, isVercelBlobUrl, TOUBA_INFOS_IMAGE_LAYOUT } from "@/lib/touba-infos-image";

const BLOB_URL = "https://876xi1t4drtxireu.public.blob.vercel-storage.com/touba-infos/articles/img-8414-I5ptEXFpTnqjk0yxTcF0QyPAPM6DO5.jpg";

describe("Touba Infos editorial images", () => {
  it("keeps Vercel Blob URLs unchanged so the original file is rendered", () => {
    expect(isVercelBlobUrl(BLOB_URL)).toBe(true);
    expect(editorialImageSrc(BLOB_URL)).toBe(BLOB_URL);
  });

  it("uses the editorial fallback only when no image URL exists", () => {
    expect(editorialImageSrc(undefined)).toBeUndefined();
    expect(editorialImageSrc("   ")).toBeUndefined();
  });

  it.each(["portrait", "square", "landscape"])("shows the whole %s article image in a uniform card frame", () => {
    expect(TOUBA_INFOS_IMAGE_LAYOUT.card).toEqual({ aspectRatio: "16 / 10", objectFit: "contain" });
  });

  it("shows portrait, square and landscape article media whole on the detail view", () => {
    expect(TOUBA_INFOS_IMAGE_LAYOUT.detail.objectFit).toBe("contain");
    expect(TOUBA_INFOS_IMAGE_LAYOUT.detail.maxHeight).toBe("min(70vh, 720px)");
  });

  it("keeps ebook covers in a vertical frame without landscape transformation", () => {
    expect(TOUBA_INFOS_IMAGE_LAYOUT.ebook).toEqual({ aspectRatio: "3 / 4", objectFit: "contain" });
  });

  it("clamps focal points for the decorative crop while centering existing content by default", () => {
    expect(focalPosition()).toBe("50% 50%");
    expect(focalPosition(-10, 150)).toBe("0% 100%");
    expect(focalPosition(34.7, 65.2)).toBe("35% 65%");
  });
});
