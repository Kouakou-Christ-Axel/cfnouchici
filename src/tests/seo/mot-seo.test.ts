import { describe, it, expect } from "vitest";
import { buildMotMetadata, buildMotJsonLd } from "@/lib/seo";

const mockMot = {
  slug: "goumin",
  mot: "Goumin",
  definition: "Se battre, se disputer entre personnes",
  categorie: "VERBE" as const,
  updatedAt: new Date("2026-01-15"),
};

describe("buildMotMetadata", () => {
  it("includes word name in title", () => {
    const meta = buildMotMetadata(mockMot);
    expect(String(meta.title)).toContain("Goumin");
  });

  it("includes definition in description", () => {
    const meta = buildMotMetadata(mockMot);
    expect(meta.description).toContain("Se battre");
  });

  it("sets OpenGraph title and description", () => {
    const meta = buildMotMetadata(mockMot);
    expect(meta.openGraph?.title).toBeDefined();
    expect(meta.openGraph?.description).toBeDefined();
  });

  it("sets Twitter card to summary_large_image", () => {
    const meta = buildMotMetadata(mockMot);
    expect(meta.twitter?.card).toBe("summary_large_image");
  });

  it("sets canonical URL pointing to /mots/[slug]", () => {
    const meta = buildMotMetadata(mockMot);
    const canonical = meta.alternates?.canonical as string;
    expect(canonical).toMatch(/\/mots\/goumin$/);
  });

  it("canonical URL does not contain UTM params", () => {
    const meta = buildMotMetadata(mockMot);
    const canonical = meta.alternates?.canonical as string;
    expect(canonical).not.toContain("utm_");
  });

  it("sets OpenGraph type to article", () => {
    const meta = buildMotMetadata(mockMot);
    expect(meta.openGraph?.type).toBe("article");
  });
});

describe("buildMotJsonLd", () => {
  it("uses DefinedTerm type", () => {
    const jsonLd = buildMotJsonLd(mockMot);
    expect(jsonLd["@type"]).toBe("DefinedTerm");
  });

  it("uses schema.org context", () => {
    const jsonLd = buildMotJsonLd(mockMot);
    expect(jsonLd["@context"]).toBe("https://schema.org");
  });

  it("includes word name", () => {
    const jsonLd = buildMotJsonLd(mockMot);
    expect(jsonLd.name).toBe("Goumin");
  });

  it("includes definition", () => {
    const jsonLd = buildMotJsonLd(mockMot);
    expect(jsonLd.description).toBe("Se battre, se disputer entre personnes");
  });

  it("includes inDefinedTermSet as DefinedTermSet", () => {
    const jsonLd = buildMotJsonLd(mockMot);
    expect(jsonLd.inDefinedTermSet["@type"]).toBe("DefinedTermSet");
  });

  it("inDefinedTermSet points to nouchi.ci", () => {
    const jsonLd = buildMotJsonLd(mockMot);
    expect(jsonLd.inDefinedTermSet.url).toContain("nouchi.ci");
  });

  it("inDefinedTermSet has a name", () => {
    const jsonLd = buildMotJsonLd(mockMot);
    expect(jsonLd.inDefinedTermSet.name).toBeTruthy();
  });
});
