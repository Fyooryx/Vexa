import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCachedPro, setCachedPro } from "../../src/lib/proCache";

describe("Vexa Pro cache migration", () => {
	beforeEach(() => {
		const store = new Map();
		vi.stubGlobal("localStorage", {
			getItem: (key) => store.get(key) ?? null,
			setItem: (key, value) => store.set(key, String(value)),
			clear: () => store.clear(),
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("reads the new Vexa cache key", () => {
		localStorage.setItem("vexa_pro", "true");
		expect(getCachedPro()).toBe(true);
	});

	it("migrates the legacy Acode cache key on read", () => {
		localStorage.setItem("acode_pro", "true");
		expect(getCachedPro()).toBe(true);
		expect(localStorage.getItem("vexa_pro")).toBe("true");
	});

	it("does not report Pro without a cached entitlement", () => {
		expect(getCachedPro()).toBe(false);
	});

	it("writes the Vexa cache key", () => {
		setCachedPro();
		expect(localStorage.getItem("vexa_pro")).toBe("true");
	});
});
