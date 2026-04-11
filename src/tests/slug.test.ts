import { describe, it, expect } from "vitest";
import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("lowercases the input", () => {
    expect(generateSlug("Goumin")).toBe("goumin");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("c'est la vie")).toBe("cest-la-vie");
  });

  it("removes accents", () => {
    expect(generateSlug("éléphant")).toBe("elephant");
  });

  it("removes special characters", () => {
    expect(generateSlug("hello!@#world")).toBe("helloworld");
  });

  it("trims leading/trailing hyphens", () => {
    expect(generateSlug(" test ")).toBe("test");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("a   b")).toBe("a-b");
  });
});
