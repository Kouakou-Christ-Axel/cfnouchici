import { describe, it, expect } from "vitest";
import { getShareUrl, getWhatsAppShareUrl, getTwitterShareUrl } from "@/lib/share";

describe("share utilities", () => {
  it("getShareUrl does not include vote=1", () => {
    const url = getShareUrl({ slug: "goumin", baseUrl: "https://nouchi.ci" });
    expect(url).not.toContain("vote=1");
    expect(url).toBe("https://nouchi.ci/mots/goumin?utm_source=share&utm_medium=link");
  });

  it("getWhatsAppShareUrl contains the word and link", () => {
    const url = getWhatsAppShareUrl({ mot: "Goumin", slug: "goumin", baseUrl: "https://nouchi.ci" });
    expect(url).toContain("wa.me");
    expect(url).toContain("Goumin");
    expect(url).not.toContain("vote=1");
  });

  it("getTwitterShareUrl contains the word and flag", () => {
    const url = getTwitterShareUrl({ mot: "Goumin", slug: "goumin", baseUrl: "https://nouchi.ci" });
    expect(url).toContain("x.com/intent/tweet");
    expect(url).toContain("Goumin");
  });
});
