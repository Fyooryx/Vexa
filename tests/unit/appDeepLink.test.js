import { describe, expect, it } from "vitest";
import { parseAppDeepLink } from "utils/appDeepLink";

describe("application deep links", () => {
	it("preserves nested deep-link values and accepts uppercase schemes", () => {
		expect(parseAppDeepLink("VEXA://module/action/a/b/c")).toEqual({
			scheme: "vexa",
			module: "module",
			action: "action",
			value: "a/b/c",
		});
	});

	it("parses the primary Vexa scheme", () => {
		expect(parseAppDeepLink("vexa://plugin/install/example.plugin")).toEqual({
			scheme: "vexa",
			module: "plugin",
			action: "install",
			value: "example.plugin",
		});
	});

	it("parses the legacy Acode scheme for compatibility", () => {
		expect(parseAppDeepLink("acode://auth/callback/token")).toEqual({
			scheme: "acode",
			module: "auth",
			action: "callback",
			value: "token",
		});
	});

	it("preserves slash-separated values", () => {
		expect(parseAppDeepLink("vexa://plugin/install/a/b")).toMatchObject({
			value: "a/b",
		});
	});

	it("rejects unrelated or malformed URLs", () => {
		expect(parseAppDeepLink("https://example.com/plugin/install")).toBeNull();
		expect(parseAppDeepLink("vexa://plugin")).toBeNull();
		expect(parseAppDeepLink(null)).toBeNull();
	});
});
