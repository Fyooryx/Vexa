import { beforeEach, describe, expect, it } from "vitest";
import {
	formatHealthSummary,
	formatMigrationStatus,
	formatVexaCapabilities,
	formatVexaHealthScore,
	formatVexaHealthSnapshot,
	formatVexaRuntimeProfile,
	formatVexaIdentityStatus,
	formatVexaWorkspacePulse,
	getActiveCodeLocation,
	getVexaRuntimeProfile,
	getVexaCapabilities,
	getVexaContextPack,
	getVexaDiagnostics,
	getVexaHealthChecks,
	getVexaHealthScore,
	getVexaHealthSnapshot,
	getVexaIdentityStatus,
	getVexaMigrationStatus,
	getVexaWorkspacePulse,
	getVexaWorkspaceReport,
	getVexaWorkspaceSnapshot,
	getWorkspaceSnapshot,
	getVexaReadiness,
	formatVexaReadiness,
	copyVexaReadiness,
	getVexaDoctorReport,
	formatVexaDoctorReport,
} from "lib/vexaDiagnostics";

describe("Vexa advanced diagnostics", () => {
	beforeEach(() => {
		globalThis.vexa = {};
		delete globalThis.acode;
		globalThis.BuildInfo = {
			versionName: "1.15.0",
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
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
			navigator: { onLine: true },
			editorManager: { files: [], activeFile: null },
		});
		expect(report).toContain("Vexa Workspace Report");
		expect(report).toContain("Package: com.vexa.app");
		expect(report).toContain("Migration phase: 2");
	});

	it("locks the public identity to Vexa", () => {
		const status = getVexaIdentityStatus({
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
		});
		expect(status.mode).toBe("VEXA_ONLY");
		expect(status.status).toBe("LOCKED");
		expect(status.failed).toBe(0);
		expect(formatVexaIdentityStatus({
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
		})).toContain("Vexa Identity Lock");
	});

	it("builds a metadata-only workspace pulse", () => {
		const pulse = getVexaWorkspacePulse({
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
			navigator: { onLine: true },
			editorManager: {
			files: [{ type: "editor", filename: "main.js", markChanged: true }],
			activeFile: { filename: "main.js", uri: "file:///workspace/main.js" },
		},
	});
		expect(pulse.schemaVersion).toBe(1);
		expect(pulse.app).toBe("Vexa");
		expect(pulse.status).toBe("READY");
		expect(pulse.dirtyFiles).toBe(1);
		expect(pulse.signals.map((signal) => signal.id)).toContain("unsaved");
		expect(formatVexaWorkspacePulse({
		buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
		navigator: { onLine: true },
		editorManager: { files: [], activeFile: null },
	})).toContain("Vexa Workspace Pulse");
	});

	it("reports runtime diagnostics with workspace counts", () => {
		const report = getVexaDiagnostics({
			buildInfo: {
				versionName: "1.15.0",
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
		expect(report).toContain("Diagnostics version: 7");
		expect(report).toContain("Online: false");
		expect(report).toContain("Unsaved files: 1");
	});

	it("exports a metadata-only workspace snapshot", () => {
		const snapshot = getVexaWorkspaceSnapshot({
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
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
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
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
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
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
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
			editorManager: { files: [], activeFile: null },
	})).toContain("Vexa Runtime Profile");
	});

	it("calculates a weighted Vexa health score", () => {
		const healthy = getVexaHealthScore({
			buildInfo: { versionName: "1.15.0", versionCode: 1019 },
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
			buildInfo: { versionName: "1.15.0", versionCode: 1019 },
			navigator: { onLine: true, clipboard: null },
		});
		expect(degraded.score).toBeLessThan(100);
		expect(degraded.status).toBe("DEGRADED");
		expect(formatVexaHealthScore({ buildInfo: { versionName: "1.15.0" }, editorManager: { files: [] } })).toContain(
			"Vexa Health Score",
		);
	});

	it("builds a consolidated Vexa health snapshot", () => {
		const snapshot = getVexaHealthSnapshot({
			buildInfo: { versionName: "1.15.0", versionCode: 1019 },
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
				buildInfo: { versionName: "1.15.0" },
				editorManager: { files: [] },
			}),
		).toContain("Vexa Health Snapshot");
	});

	it("includes readiness in the runtime profile and supports copying it", async () => {
		const runtime = {
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
			editorManager: { files: [] },
			navigator: { onLine: true, clipboard: { writeText: async () => {} } },
		};
		const profile = getVexaRuntimeProfile(runtime);
		expect(profile.readiness).toMatchObject({ status: "READY", blockers: [] });

		const writes = [];
		const copied = await copyVexaReadiness({
			...runtime,
			clipboard: {
				writeText: async (value) => writes.push(value),
			},
		});
		expect(copied).toBe(true);
		expect(writes[0]).toContain("Vexa Readiness Gate");
	});

	it("reports the Vexa capability matrix", () => {
		const capabilities = getVexaCapabilities({
			buildInfo: { versionName: "1.15.0" },
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
	it("derives a deterministic readiness state from health and workspace signals", () => {
		const ready = getVexaReadiness({
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
			editorManager: { files: [] },
			navigator: { onLine: true, clipboard: { writeText: async () => {} } },
		});
		expect(ready.status).toBe("READY");
		expect(ready.blockers).toEqual([]);
		expect(ready.recommendations).toEqual([]);

		const blocked = getVexaReadiness({
			editorManager: null,
			navigator: { onLine: false },
		});
		expect(blocked.status).toBe("BLOCKED");
		expect(blocked.blockers).toContain("Editor manager unavailable");
		expect(blocked.signals).toContain("Network offline");
		expect(blocked.recommendations.length).toBeGreaterThan(0);
		expect(formatVexaReadiness({ editorManager: null, navigator: { onLine: false } })).toContain(
			"Vexa Readiness Gate",
		);
	});

	it("builds a consolidated Vexa Doctor report", () => {
		const runtime = {
			buildInfo: { versionName: "1.15.0", packageName: "com.vexa.app" },
			navigator: { onLine: true, clipboard: { writeText: async () => {} } },
			editorManager: { files: [], activeFile: null },
		};
		const doctor = getVexaDoctorReport(runtime);
		expect(doctor.schemaVersion).toBe(1);
		expect(doctor.app).toBe("Vexa");
		expect(doctor.status).toBe("READY");
		expect(doctor.coreBoundary.status).toBe("CANONICAL");
		expect(doctor.identity.status).toBe("LOCKED");
		expect(doctor.readiness.status).toBe("READY");
		expect(doctor.health.status).toBe("HEALTHY");
		expect(doctor.capabilities.workspaceReport).toBe(true);
		expect(formatVexaDoctorReport(runtime)).toContain("Vexa Doctor");

		delete globalThis.vexa;
		globalThis.acode = {};
		const fallbackDoctor = getVexaDoctorReport(runtime);
		expect(fallbackDoctor.status).toBe("DEGRADED");
		expect(fallbackDoctor.coreBoundary.status).toBe("LEGACY_FALLBACK");

		delete globalThis.acode;
		const blockedDoctor = getVexaDoctorReport(runtime);
		expect(blockedDoctor.status).toBe("BLOCKED");
		expect(blockedDoctor.coreBoundary.status).toBe("UNAVAILABLE");
		expect(blockedDoctor.recommendations).toContain(
			"Restore the canonical Vexa runtime before continuing.",
		);
	});

	it("summarizes health checks deterministically", () => {
		const checks = getVexaHealthChecks({
			buildInfo: { versionName: "1.15.0" },
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