import { describe, expect, it } from "vitest";
import { clampQuality, DEFAULT_IMAGE_QUALITY, IMAGE_SIZE_DIMENSIONS, scaledDimensions } from "@/lib/media/image";
import { extensionForMime, mediaFileName, toUploadFile } from "@/lib/media/upload";

describe("image sizing", () => {
  it("scales down so the longest side fits the max dimension", () => {
    expect(scaledDimensions(1000, 500, 500)).toEqual({ width: 500, height: 250 });
    expect(scaledDimensions(500, 1000, 500)).toEqual({ width: 250, height: 500 });
  });

  it("keeps images that already fit", () => {
    expect(scaledDimensions(100, 80, 500)).toEqual({ width: 100, height: 80 });
    expect(scaledDimensions(0, 0, 500)).toEqual({ width: 0, height: 0 });
  });

  it("clamps quality into 0..1 with a default", () => {
    expect(clampQuality(2)).toBe(1);
    expect(clampQuality(-1)).toBe(0);
    expect(clampQuality(Number.NaN)).toBe(DEFAULT_IMAGE_QUALITY);
    expect(clampQuality(undefined)).toBe(DEFAULT_IMAGE_QUALITY);
  });

  it("exposes thumbnail/medium/full size conventions", () => {
    expect(IMAGE_SIZE_DIMENSIONS.thumbnail).toBeLessThan(IMAGE_SIZE_DIMENSIONS.medium);
    expect(IMAGE_SIZE_DIMENSIONS.medium).toBeLessThan(IMAGE_SIZE_DIMENSIONS.full);
  });
});

describe("media upload mapping", () => {
  it("derives an extension from mime type or media kind", () => {
    expect(extensionForMime("image/jpeg")).toBe(".jpg");
    expect(extensionForMime(undefined, "video")).toBe(".mp4");
    expect(extensionForMime(undefined, "image")).toBe(".jpg");
    expect(extensionForMime(undefined)).toBe("");
  });

  it("prefers an explicit file name", () => {
    expect(mediaFileName({ uri: "file:///x/y.mov", fileName: "clip.mov" })).toBe("clip.mov");
    expect(mediaFileName({ uri: "file:///x", mimeType: "image/png" })).toBe("upload.png");
    expect(mediaFileName({ uri: "file:///x", kind: "image" })).toBe("upload.jpg");
  });

  it("maps an asset to the transfer UploadFile shape", () => {
    expect(toUploadFile({ uri: "file:///x", kind: "image" })).toEqual({ uri: "file:///x", name: "upload.jpg", type: "image/jpeg" });
    expect(toUploadFile({ uri: "file:///x", kind: "video", mimeType: "video/mp4" }, "clip")).toEqual({ uri: "file:///x", name: "clip.mp4", type: "video/mp4" });
  });
});
