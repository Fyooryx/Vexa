import { describe, expect, it } from "vitest";
import {
  VEXA_IDENTITY,
  getRuntimePackageName,
} from "lib/vexaIdentity";

describe("Vexa identity boundaries", () => {
  it("keeps canonical product identity stable", () => {
    expect(VEXA_IDENTITY.NAME).toBe("Vexa");
    expect(VEXA_IDENTITY.PACKAGE_NAME).toBe("com.vexa.app");
    expect(VEXA_IDENTITY.FREE_PACKAGE_NAME).toBe("com.vexa.appfree");
    expect(VEXA_IDENTITY.URL_SCHEME).toBe("vexa");
    expect(VEXA_IDENTITY.LEGACY_URL_SCHEME).toBe("acode");
  });

  it("keeps upstream and Vexa release boundaries explicit", () => {
    expect(VEXA_IDENTITY.REPOSITORY_URL).toBe("https://github.com/Fyooryx/Vexa");
    expect(VEXA_IDENTITY.UPSTREAM_REPOSITORY_URL).toBe(
      "https://github.com/Acode-Foundation/Acode",
    );
    expect(VEXA_IDENTITY.RELEASES_API_URL).toContain("/Fyooryx/Vexa/releases");
    expect(VEXA_IDENTITY.UPSTREAM_RELEASES_API_URL).toContain(
      "/Acode-Foundation/Acode/releases",
    );
  });

  it("normalizes runtime package metadata without changing canonical defaults", () => {
    expect(getRuntimePackageName({ packageName: "com.vexa.app" })).toBe(
      "com.vexa.app",
    );
    expect(getRuntimePackageName({})).toBe("com.vexa.app");
  });
});
