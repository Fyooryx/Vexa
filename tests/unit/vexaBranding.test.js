import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");

const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

describe("Vexa branding", () => {
  it("keeps application identity aligned", () => {
    const config = read("config.xml");
    const packageJson = JSON.parse(read("package.json"));
    const packageLock = JSON.parse(read("package-lock.json"));

    expect(config).toMatch(/<widget[^>]*\sid="com\.vexa\.app"/);
    expect(config).toMatch(/<name>Vexa<\/name>/);
    expect(packageJson.name).toBe("com.vexa.app");
    expect(packageJson.displayName).toBe("Vexa");
    expect(packageLock.name).toBe("com.vexa.app");
  });

  it("uses the Vexa asset for active launcher/icon selection", () => {
    const config = read("config.xml");
    const appIcons = read("src/lib/appIcons.js");

    expect(config).not.toMatch(/@mipmap\/ic_acode_/);
    expect(config).toMatch(/android:icon="@drawable\/vexa_icon"/);
    expect(appIcons).toMatch(/icons\/vexa\.svg/);
    expect(appIcons).not.toMatch(/icons\/ic_acode_/);
  });

  it("uses the Vexa log filename", () => {
    expect(read("src/lib/config.js")).toMatch(/LOG_FILE_NAME:\s*"Vexa\.log"/);
  });
});
