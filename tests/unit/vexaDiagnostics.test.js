import { describe, expect, it } from "vitest";
import { getVexaDiagnostics } from "../../src/lib/vexaDiagnostics";

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
		expect(report).toContain("Deep link: vexa://");
		expect(report).toContain("Legacy deep link: acode://");
	});
});