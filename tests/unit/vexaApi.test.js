import { describe, expect, it, beforeEach } from "vitest";
import {
  getVexaCore,
  vexaAddIcon,
  vexaExec,
  getVexaFormatters,
  vexaGetFormatterFor,
  getVexaCoreBoundaryStatus,
} from "lib/vexaApi";

describe("Vexa core boundary", () => {
  beforeEach(() => {
    delete globalThis.vexa;
    delete globalThis.acode;
  });

  it("prefers the canonical Vexa global over the legacy compatibility bridge", () => {
    const vexa = { name: "vexa", exec: () => "vexa" };
    const acode = { name: "acode", exec: () => "acode" };
    globalThis.vexa = vexa;
    globalThis.acode = acode;

    expect(getVexaCore()).toBe(vexa);
    expect(vexaExec("noop")).toBe("vexa");
  });

  it("falls back to the legacy global only when the Vexa global is unavailable", () => {
    const acode = { exec: () => "legacy" };
    globalThis.acode = acode;

    expect(getVexaCore()).toBe(acode);
    expect(vexaExec("noop")).toBe("legacy");
  });

  it("reports explicit canonical, legacy-fallback, and unavailable boundary states", () => {
    expect(getVexaCoreBoundaryStatus()).toMatchObject({
      schemaVersion: 1,
      status: "UNAVAILABLE",
      canonical: false,
      legacyFallback: false,
    });

    globalThis.acode = {};
    expect(getVexaCoreBoundaryStatus()).toMatchObject({
      status: "LEGACY_FALLBACK",
      canonical: false,
      legacyFallback: true,
    });

    globalThis.vexa = {};
    expect(getVexaCoreBoundaryStatus()).toMatchObject({
      status: "CANONICAL",
      canonical: true,
      legacyFallback: false,
    });
  });

  it("keeps capability calls safe when the runtime boundary is unavailable", () => {
    expect(vexaExec("noop")).toBeUndefined();
    expect(vexaAddIcon("id", "src")).toBeUndefined();
    expect(getVexaFormatters()).toEqual([]);
    expect(vexaGetFormatterFor(["js"])).toEqual([]);
  });

  it("delegates icon and formatter access through the Vexa boundary", () => {
    const added = [];
    const core = {
      formatters: [{ id: "prettier", name: "Prettier" }],
      addIcon: (...args) => added.push(args),
      getFormatterFor: (extensions) => extensions.map((ext) => "formatter:" + ext),
    };
    globalThis.vexa = core;

    vexaAddIcon("html-project-icon", "data:image/png;base64,test");
    expect(added).toEqual([["html-project-icon", "data:image/png;base64,test"]]);
    expect(getVexaFormatters()).toEqual(core.formatters);
    expect(vexaGetFormatterFor(["js", "ts"])).toEqual(["formatter:js", "formatter:ts"]);
  });
});
