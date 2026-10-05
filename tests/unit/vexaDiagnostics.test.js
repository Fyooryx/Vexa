import { beforeEach, describe, expect, it } from "vitest";
import {
	formatHealthSummary,
	formatMigrationStatus,
	formatVexaCapabilities,
	getVexaCapabilities,
	getActiveCodeLocation,
	getVexaDiagnostics,
	getVexaHealthChecks,
	getVexaMigrationStatus,
	getVexaWorkspaceReport,
	getWorkspaceSnapshot,
} from "lib/vexaDiagnostics";

describe("Vexa advanced diagnostics", () => {
	beforeEach(() => {
		globalThis.BuildInfo = {
			versionName: "1.14.6",
			versionCode: 1019,
			packageName: "com.vexa.app",
		};
	});

	it("captures active workspace state", () => {
		const editorManager = {
			files: [
				{
					type: "editor",
					filename: "main.js",
					uri: "file:///workspace/main.js",
					markChanged: true,
				},
				{
					type: "editor",
					filename: "README.md",
					uri: "file:///workspace/README.md",
					markChanged: false,
				},
			],
			activeFile: {
				filename: "main.js",
				uri: "file:///workspace/main.js",
			},
			editor: {
				state: {
					doc: { lineAt: () => ({ number: 12, from: 40 }) },
					selection: { main: { head: 46 } },
				},
			},
		};
		const snapshot = getWorkspaceSnapshot({
			editorManager,
			navigator: { onLine: true },
		});
		expect(snapshot.openFiles).toBe(2);
		expect(snapshot.dirtyFiles).toBe(1);
		expect(snapshot.activeFile).toBe("main.js");
		expect(snapshot.selection).toEqual({ line: 12, column: 7 });
	});

	it("creates a copyable code location", () => {
		const editorManager = {
			files: [
				{ type: "editor", filename: "main.js", uri: "file:///workspace/main.js" },
			],
			activeFile: { filename: "main.js" },
			editor: {
				state: {
					doc: { lineAt: () => ({ number: 4, from: 10 }) },
					selection: { main: { head: 14 } },
				},
			},
		};
		expect(getActiveCodeLocation({ editorManager })).toBe("main.js:4:5");
	});

	it("produces a Vexa workspace report", () => {
		const report = getVexaWorkspaceReport({
			buildInfo: { versionName: "1.14.6", packageName: "com.vexa.app" },
			navigator: { onLine: true },
			editorManager: { files: [], activeFile: null },
		});
		expect(report).toContain("Vexa Workspace Report");
		expect(report).toContain("Package: com.vexa.app");
		expect(report).toContain("Migration phase: 1");
	});

	it("reports runtime diagnostics with workspace counts", () => {
		const report = getVexaDiagnostics({
			buildInfo: {
				versionName: "1.14.6",
				versionCode: 1019,
				packageName: "com.vexa.app",
			},
			navigator: { onLine: false, language: "id-ID" },
			device: {
				version: "14",
				platform: "Android",
				model: "test",
				manufacturer: "test",
			},
			editorManager: {
				files: [{ type: "editor", markChanged: true }],
			},
		});
		expect(report).toContain("Diagnostics version: 4");
		expect(report).toContain("Online: false");
		expect(report).toContain("Unsaved files: 1");
	});

	it("reports the Vexa capability matrix", () => {
		const capabilities = getVexaCapabilities({
			buildInfo: { versionName: "1.14.6" },
			editorManager: { files: [], editor: { state: {} } },
			navigator: { clipboard: { writeText: async () => {} } },
		});
		expect(capabilities.workspaceReport).toBe(true);
		expect(capabilities.healthCheck).toBe(true);
		expect(capabilities.migrationStatus).toBe(true);
		expect(capabilities.clipboard).toBe(true);
		expect(formatVexaCapabilities()).toContain("Vexa Capabilities");
	});
	it("summarizes health checks deterministically", () => {
		const checks = getVexaHealthChecks({
			buildInfo: { versionName: "1.14.6" },
			editorManager: { files: [] },
			navigator: {
				onLine: true,
				clipboard: { writeText: async () => {} },
			},
		});
		const summary = formatHealthSummary(checks);
		expect(summary).toMatchObject({ ok: true, failed: 0 });
		expect(summary.passed).toBe(checks.length);
	});
});