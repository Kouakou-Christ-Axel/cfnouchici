import { describe, it, expect } from "vitest";
import { navLinks } from "@/config/navigation";
import { existsSync } from "fs";
import path from "path";

describe("/a-propos", () => {
  it("has /a-propos link in navigation config", () => {
    const link = navLinks.find((l) => l.href === "/a-propos");
    expect(link).toBeDefined();
    expect(link!.title).toBeTruthy();
  });

  it("page file exists at correct path", () => {
    const pagePath = path.resolve("src/app/(public)/a-propos/page.tsx");
    expect(existsSync(pagePath)).toBe(true);
  });
});
