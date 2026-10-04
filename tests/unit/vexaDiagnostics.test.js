import { describe, expect, it } from "vitest";
import {
	copyVexaDiagnostics,
	getVexaDiagnostics,
} from "../../src/lib/vexaDiagnostics";

describe("Vexa diagnostics", () => {
	it("produces a stable support report from injected runtime data", () => {
		const report = getVexaDiagnostics({
			buildInfo: {
				versionName: "1.14.2",
				versionCode: 1015,
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
		expect(report).toContain("Diagnostics version: 3");
		expect(report).toContain("Version: 1.14.2");
		expect(report).toContain("Package: com.vexa.app");
		expect(report).toContain("Android: 14");
		expect(report).toContain("Model: Test Device");
		expect(report).toContain("Online: true");
		expect(report).toContain("Product boundary: Vexa application");
		expect(report).toContain("Service boundary: upstream service");
		expect(report).toContain("Report scope: runtime metadata only");
	});

	it("uses the injected clipboard before global runtime state", async () => {
		let copied = "";
		const result = await copyVexaDiagnostics({
			navigator: {
				clipboard: {
					writeText: async (value) => {
						copied = value;
					},
				},
			},
			buildInfo: {
				versionName: "1.14.2",
				versionCode: 1015,
				packageName: "com.vexa.app",
			},
		});

		expect(result).toBe(true);
		expect(copied).toContain("Package: com.vexa.app");
		expect(copied).toContain("Diagnostics version: 3");
	});
});
