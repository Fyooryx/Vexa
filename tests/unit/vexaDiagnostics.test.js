import { beforeEach, describe, expect, it } from "vitest";
import {
	formatHealthSummary,
	formatMigrationStatus,
	formatVexaCapabilities,
	formatVexaHealthScore,
	formatVexaHealthSnapshot,
	formatVexaRuntimeProfile,
	getActiveCodeLocation,
	getVexaRuntimeProfile,
	getVexaCapabilities,
	getVexaContextPack,
	getVexaDiagnostics,
	getVexaHealthChecks,
	getVexaHealthScore,
	getVexaHealthSnapshot,
	getVexaMigrationStatus,
	getVexaWorkspaceReport,
	getVexaWorkspaceSnapshot,
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
		expect(report).toContain("Migration phase: 2");
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

	it("exports a metadata-only workspace snapshot", () => {
		const snapshot = getVexaWorkspaceSnapshot({
			buildInfo: { versionName: "1.14.6", packageName: "com.vexa.app" },
			editorManager: {
				files: [
					{
						type: "editor",
						filename: "main.js",
						uri: "file:///workspace/main.js",
						markChanged: true,
						pinned: true,
					},
				],
				activeFile: { filename: "main.js", uri: "file:///workspace/main.js" },
			},
		});
		expect(snapshot.schemaVersion).toBe(1);
		expect(snapshot.app).toBe("Vexa");
		expect(snapshot.package).toBe("com.vexa.app");
		expect(snapshot.files[0]).toMatchObject({
			filename: "main.js",
			dirty: true,
			pinned: true,
		});
		expect(snapshot.files[0]).not.toHaveProperty("content");
	});

	it("builds a shareable Vexa developer context pack", () => {
		const pack = getVexaContextPack({
			buildInfo: { versionName: "1.14.6", packageName: "com.vexa.app" },
			navigator: { onLine: true },
			editorManager: { files: [], activeFile: null },
		});
		expect(pack).toContain("Vexa Developer Context Pack");
		expect(pack).toContain("Vexa Workspace Report");
		expect(pack).toContain("Vexa Migration Status");
		expect(pack).toContain("Vexa Capabilities");
		expect(pack).toContain("Vexa Health Summary");
	});

	it("builds a stable Vexa runtime profile", () => {
		const profile = getVexaRuntimeProfile({
			buildInfo: { versionName: "1.14.6", packageName: "com.vexa.app" },
			device: { platform: "Android" },
			navigator: {
				language: "id-ID",
				onLine: true,
				clipboard: { writeText: async () => {} },
			},
			editorManager: {
				files: [
					{ type: "editor", markChanged: true },
					{ type: "editor", markChanged: false },
				],
				activeFile: { filename: "main.js" },
			},
		});
		expect(profile.schemaVersion).toBe(1);
		expect(profile.app).toBe("Vexa");
		expect(profile.package).toBe("com.vexa.app");
		expect(profile.platform).toBe("Android");
		expect(profile.openFiles).toBe(2);
		expect(profile.dirtyFiles).toBe(1);
		expect(profile.health).toMatchObject({ ok: true, failed: 0 });
		expect(formatVexaRuntimeProfile({
			buildInfo: { versionName: "1.14.6", packageName: "com.vexa.app" },
			editorManager: { files: [], activeFile: null },
	})).toContain("Vexa Runtime Profile");
	});

	it("calculates a weighted Vexa health score", () => {
		const healthy = getVexaHealthScore({
			buildInfo: { versionName: "1.14.6", versionCode: 1019 },
			editorManager: { files: [] },
			navigator: {
				onLine: true,
				clipboard: { writeText: async () => {} },
			},
		});
		expect(healthy.score).toBe(100);
		expect(healthy.status).toBe("HEALTHY");
		expect(healthy.failed).toBe(0);

		const degraded = getVexaHealthScore({
			buildInfo: { versionName: "1.14.6", versionCode: 1019 },
			navigator: { onLine: true, clipboard: null },
		});
		expect(degraded.score).toBeLessThan(100);
		expect(degraded.status).toBe("DEGRADED");
		expect(formatVexaHealthScore({ buildInfo: { versionName: "1.14.6" }, editorManager: { files: [] } })).toContain(
			"Vexa Health Score",
		);
	});

	it("builds a consolidated Vexa health snapshot", () => {
		const snapshot = getVexaHealthSnapshot({
			buildInfo: { versionName: "1.14.6", versionCode: 1019 },
			navigator: {
				onLine: true,
				language: "id-ID",
				clipboard: { writeText: async () => {} },
			},
			editorManager: {
				files: [
					{ type: "editor", markChanged: true },
					{ type: "editor", markChanged: false },
				],
				activeFile: {
					filename: "main.js",
					uri: "file:///workspace/main.js",
				},
			},
		});
		expect(snapshot.schemaVersion).toBe(1);
		expect(snapshot.app).toBe("Vexa");
		expect(snapshot.package).toBe("com.vexa.app");
		expect(snapshot.health.score).toBe(100);
		expect(snapshot.health.status).toBe("HEALTHY");
		expect(snapshot.workspace.openFiles).toBe(2);
		expect(snapshot.workspace.dirtyFiles).toBe(1);
		expect(snapshot.capabilities.healthSnapshot).toBe(true);
		expect(
			formatVexaHealthSnapshot({
				buildInfo: { versionName: "1.14.6" },
				editorManager: { files: [] },
			}),
		).toContain("Vexa Health Snapshot");
	});

	it("reports the Vexa capability matrix", () => {
		const capabilities = getVexaCapabilities({
			buildInfo: { versionName: "1.14.6" },
			editorManager: { files: [], editor: { state: {} } },
			navigator: { clipboard: { writeText: async () => {} } },
		});
		expect(capabilities.workspaceReport).toBe(true);
		expect(capabilities.workspaceCheckpoint).toBe(true);
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