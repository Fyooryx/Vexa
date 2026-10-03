import { describe, expect, it, vi } from "vitest";
import {
	copyVexaDiagnostics,
	getVexaDiagnostics,
} from "../../src/lib/vexaDiagnostics";

describe("Vexa diagnostics", () => {
	it("produces a stable support report from injected runtime data", () => {
		const report = getVexaDiagnostics({
			buildInfo: {
				versionName: "1.14.1",
				versionCode: 1014,
				packageName: "com.vexa.app",
			},
			device: {
				version: "14",
				platform: "Android",
				model: "Test Device",
				manufacturer: "Test",
			},
			navigator: {
				language: "en-US",
				onLine: true,
			},
		});

		expect(report).toContain("App: Vexa");
		expect(report).toContain("Version: 1.14.1");
		expect(report).toContain("Package: com.vexa.app");
		expect(report).toContain("Android: 14");
		expect(report).toContain("Model: Test Device");
		expect(report).toContain("Online: true");
	});
});

describe("Vexa diagnostics clipboard", () => {
	it("uses the injected navigator clipboard when available", async () => {
		const writeText = vi.fn().mockResolvedValue();
		const copied = await copyVexaDiagnostics({
			navigator: { clipboard: { writeText } },
			buildInfo: { versionName: "1.14.1", versionCode: 1014, packageName: "com.vexa.app" },
		});

		expect(copied).toBe(true);
		expect(writeText).toHaveBeenCalledOnce();
		expect(writeText.mock.calls[0][0]).toContain("App: Vexa");
	});

	it("falls back to the injected Cordova clipboard", async () => {
		const copy = vi.fn();
		const copied = await copyVexaDiagnostics({
			navigator: { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } },
			cordova: { plugins: { clipboard: { copy } } },
		});

		expect(copied).toBe(true);
		expect(copy).toHaveBeenCalledOnce();
	});

	it("reports false when no clipboard implementation exists", async () => {
		const copied = await copyVexaDiagnostics({
			navigator: {},
			cordova: {},
		});

		expect(copied).toBe(false);
	});
});
