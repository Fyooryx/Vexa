import { describe, expect, it } from "vitest";
import { parseAppIntentUrl } from "../../src/utils/appIntent";

describe("Vexa app intent parser", () => {
	it.each([
		["vexa://plugin/install/example.plugin", "vexa"],
		["VEXA://plugin/install/example.plugin", "vexa"],
		["acode://plugin/install/example.plugin", "acode"],
	])("parses supported scheme: %s", (url, scheme) => {
		expect(parseAppIntentUrl(url)).toEqual({
			scheme,
			module: "plugin",
			action: "install",
			value: "example.plugin",
		});
	});

	it("preserves nested values instead of truncating slash-separated data", () => {
		expect(parseAppIntentUrl("vexa://module/action/a/b/c")).toEqual({
			scheme: "vexa",
			module: "module",
			action: "action",
			value: "a/b/c",
		});
	});

	it.each([
		undefined,
		null,
		123,
		"",
		"https://example.com/plugin/install/example.plugin",
		"vexa://",
		"vexa://module",
		"foo://module/action/value",
	])("rejects invalid app intents: %s", (url) => {
		expect(parseAppIntentUrl(url)).toBeNull();
	});
});
