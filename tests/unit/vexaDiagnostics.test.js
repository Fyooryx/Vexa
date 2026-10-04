import { describe, expect, it } from "vitest";
import {
	copyVexaDiagnostics,
	getVexaDiagnosticData,
	getVexaDiagnostics,
} from "../../src/lib/vexaDiagnostics";

describe("Vexa diagnostics", () => {
	it("produces a stable support report from injected runtime data", () => {
		const report = getVexaDiagnostics({
			buildInfo: {
				versionName: "1.14.3",
				versionCode: 1016,
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
		expect(report).toContain("Diagnostics version: 4");
		expect(report).toContain("Version: 1.14.3");
		expect(report).toContain("Package: com.vexa.app");
		expect(report).toContain("Android: 14");
		expect(report).toContain("Model: Test Device");
		expect(report).toContain("Online: true");
		expect(report).toContain("Editor: cm");
		expect(report).toContain("URL scheme: vexa (legacy: acode)");
		expect(report).toContain("Product boundary: Vexa application");
		expect(report).toContain("Service boundary: upstream service");
		expect(report).toContain("Report scope: runtime metadata only");
		expect(report).not.toContain("token");
		expect(report).not.toContain("password");
	});

	it("exposes structured diagnostics without secrets", () => {
		const data = getVexaDiagnosticData({
			buildInfo: {
				versionName: "1.14.3",
				versionCode: 1016,
				packageName: "com.vexa.app",
			},
			navigator: {
			language: "id-ID",
			onLine: false,
		},
		});

		expect(data.diagnosticsVersion).toBe(4);
		expect(data.packageName).toBe("com.vexa.app");
		expect(data.urlScheme).toBe("vexa");
		expect(data.legacyUrlScheme).toBe("acode");
		expect(data.reportScope).toBe("runtime metadata only");
		expect(JSON.stringify(data).toLowerCase()).not.toContain("token");
		expect(JSON.stringify(data).toLowerCase()).not.toContain("password");
	});

	it("returns false when no clipboard provider is available", async () => {
		expect(await copyVexaDiagnostics({
			navigator: {},
		cordova: {},
		})).toBe(false);
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
				versionName: "1.14.3",
				versionCode: 1016,
				packageName: "com.vexa.app",
			},
		});

		expect(result).toBe(true);
		expect(copied).toContain("Package: com.vexa.app");
		expect(copied).toContain("Diagnostics version: 4");
	});
});
