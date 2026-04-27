import { describe, it, expect } from "vitest";
import { checkRouteAccess } from "@/proxy";

describe("checkRouteAccess", () => {
  it("allows authenticated user on /proposer", () => {
    const result = checkRouteAccess("/proposer", { id: "u1", role: "USER" });
    expect(result.allowed).toBe(true);
  });

  it("denies unauthenticated user on /proposer", () => {
    const result = checkRouteAccess("/proposer", null);
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.redirect).toBe("/connexion?callbackUrl=/proposer");
  });

  it("allows MODERATEUR on /admin", () => {
    const result = checkRouteAccess("/admin", { id: "u1", role: "MODERATEUR" });
    expect(result.allowed).toBe(true);
  });

  it("allows ADMIN on /admin/mots", () => {
    const result = checkRouteAccess("/admin/mots", { id: "u1", role: "ADMIN" });
    expect(result.allowed).toBe(true);
  });

  it("denies USER on /admin", () => {
    const result = checkRouteAccess("/admin", { id: "u1", role: "USER" });
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.redirect).toBe("/");
  });

  it("denies unauthenticated on /admin", () => {
    const result = checkRouteAccess("/admin", null);
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.redirect).toBe("/connexion?callbackUrl=/admin");
  });

  it("allows anyone on public routes", () => {
    const result = checkRouteAccess("/mots", null);
    expect(result.allowed).toBe(true);
  });
});
