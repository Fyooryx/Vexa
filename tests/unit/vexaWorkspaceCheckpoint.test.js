import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearVexaWorkspaceCheckpoints,
	formatVexaWorkspaceCheckpoints,
	getVexaWorkspaceCheckpoints,
	restoreVexaWorkspaceCheckpoint,
	saveVexaWorkspaceCheckpoint,
	VEXA_CHECKPOINT_LIMIT,
} from "lib/vexaWorkspaceCheckpoint";

function createStorage() {
	const values = new Map();
	return {
		getItem(key) {
			return values.get(key) ?? null;
		},
		setItem(key, value) {
			values.set(key, String(value));
		},
	};
}

function createEditorManager() {
	return {
		activeFile: {
			type: "editor",
			filename: "main.js",
			uri: "file:///workspace/main.js",
		},
		editor: {
			state: {
				doc: {
					lineAt: () => ({ number: 12, from: 40 }),
				},
				selection: {
					main: { head: 46 },
				},
			},
		},
	};
}

describe("Vexa workspace checkpoints", () => {
	let storage;

	beforeEach(() => {
		storage = createStorage();
	});

	it("saves a metadata-only active editor checkpoint", () => {
		const checkpoint = saveVexaWorkspaceCheckpoint({
			storage,
			editorManager: createEditorManager(),
			now: () => 1000,
		});

		expect(checkpoint).toMatchObject({
			filename: "main.js",
			uri: "file:///workspace/main.js",
			line: 12,
			column: 7,
			createdAt: 1000,
		});
		expect(getVexaWorkspaceCheckpoints({ storage })).toHaveLength(1);
	});

	it("deduplicates identical checkpoints and caps history", () => {
		const manager = createEditorManager();
		for (let time = 1; time <= VEXA_CHECKPOINT_LIMIT + 2; time++) {
			manager.editor.state.selection.main.head = time;
			saveVexaWorkspaceCheckpoint({
				storage,
				editorManager: manager,
				now: () => time,
			});
		}
		saveVexaWorkspaceCheckpoint({
			storage,
			editorManager: createEditorManager(),
			now: () => 999,
		});

		const checkpoints = getVexaWorkspaceCheckpoints({ storage });
		expect(checkpoints).toHaveLength(VEXA_CHECKPOINT_LIMIT);
		expect(checkpoints[0].createdAt).toBe(999);
	});

	it("restores the latest checkpoint through the normal openFile path", async () => {
		saveVexaWorkspaceCheckpoint({
			storage,
			editorManager: createEditorManager(),
			now: () => 42,
		});
		const openFile = vi.fn().mockResolvedValue(undefined);

		const restored = await restoreVexaWorkspaceCheckpoint(undefined, {
			storage,
			openFile,
		});

		expect(restored).toBe(true);
		expect(openFile).toHaveBeenCalledWith("file:///workspace/main.js", {
			cursorPos: { row: 12, column: 7 },
			render: true,
		});
	});

	it("formats and clears checkpoint history", () => {
		saveVexaWorkspaceCheckpoint({
			storage,
			editorManager: createEditorManager(),
			now: () => 42,
		});
		expect(formatVexaWorkspaceCheckpoints({ storage })).toContain(
			"main.js:12:7",
		);
		expect(clearVexaWorkspaceCheckpoints({ storage })).toBe(true);
		expect(getVexaWorkspaceCheckpoints({ storage })).toEqual([]);
	});
});
