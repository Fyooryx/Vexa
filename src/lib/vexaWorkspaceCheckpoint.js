import openFile from "./openFile";

export const VEXA_CHECKPOINT_SCHEMA_VERSION = 1;
export const VEXA_CHECKPOINT_STORAGE_KEY = "vexa_workspace_checkpoints_v1";
export const VEXA_CHECKPOINT_LIMIT = 5;

function getStorage(runtime = {}) {
	return runtime.storage ?? globalThis.localStorage ?? null;
}

function getNow(runtime = {}) {
	return typeof runtime.now === "function" ? runtime.now() : () => Date.now();
}

function readCheckpoints(runtime = {}) {
	const storage = getStorage(runtime);
	if (!storage?.getItem) return [];
	try {
		const raw = storage.getItem(VEXA_CHECKPOINT_STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isValidCheckpoint);
	} catch {
		return [];
	}
}

function writeCheckpoints(checkpoints, runtime = {}) {
	const storage = getStorage(runtime);
	if (!storage?.setItem) return false;
	try {
		storage.setItem(
			VEXA_CHECKPOINT_STORAGE_KEY,
			JSON.stringify(checkpoints.slice(0, VEXA_CHECKPOINT_LIMIT)),
		);
		return true;
	} catch {
		return false;
	}
}

function isValidCheckpoint(value) {
	return Boolean(
		value &&
			value.schemaVersion === VEXA_CHECKPOINT_SCHEMA_VERSION &&
			typeof value.uri === "string" &&
			value.uri &&
			Number.isInteger(value.line) &&
			value.line >= 1 &&
			Number.isInteger(value.column) &&
			value.column >= 1 &&
			typeof value.filename === "string" &&
			value.filename,
	);
}

function getActiveCheckpoint(runtime = {}) {
	const editorManager = runtime.editorManager ?? globalThis.editorManager;
	const file = editorManager?.activeFile;
	const state = editorManager?.editor?.state;
	const selection = state?.selection?.main;
	const doc = state?.doc;

	if (
		!file ||
		file.type !== "editor" ||
		typeof file.uri !== "string" ||
		!file.uri ||
		!selection ||
		!doc?.lineAt
	) {
		return null;
	}

	const line = doc.lineAt(selection.head);
	return {
		filename: file.filename || file.name || file.uri,
		uri: file.uri,
		line: Math.max(1, line.number),
		column: Math.max(1, selection.head - line.from + 1),
	};
}

export function getVexaWorkspaceCheckpoints(runtime = {}) {
	return readCheckpoints(runtime).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveVexaWorkspaceCheckpoint(runtime = {}) {
	const active = getActiveCheckpoint(runtime);
	if (!active) return null;

	const now = getNow(runtime)();
	const checkpoint = {
		schemaVersion: VEXA_CHECKPOINT_SCHEMA_VERSION,
		id: "checkpoint-" + now,
		createdAt: now,
		...active,
	};

	const existing = getVexaWorkspaceCheckpoints(runtime).filter(
		(item) =>
			item.uri !== checkpoint.uri ||
			item.line !== checkpoint.line ||
			item.column !== checkpoint.column,
	);
	const checkpoints = [checkpoint, ...existing];
	if (!writeCheckpoints(checkpoints, runtime)) return null;
	return checkpoint;
}

export async function restoreVexaWorkspaceCheckpoint(
	checkpointOrIndex,
	runtime = {},
) {
	const checkpoints = getVexaWorkspaceCheckpoints(runtime);
	const checkpoint =
		typeof checkpointOrIndex === "number"
			? checkpoints[checkpointOrIndex]
			: checkpointOrIndex && isValidCheckpoint(checkpointOrIndex)
				? checkpointOrIndex
				: checkpoints[0];

	if (!checkpoint) return false;

	const opener = runtime.openFile ?? openFile;
	if (typeof opener !== "function") return false;

	await opener(checkpoint.uri, {
		cursorPos: {
			row: checkpoint.line,
			column: checkpoint.column,
		},
		render: true,
	});
	return true;
}

export function clearVexaWorkspaceCheckpoints(runtime = {}) {
	return writeCheckpoints([], runtime);
}

export function formatVexaWorkspaceCheckpoints(runtime = {}) {
	const checkpoints = getVexaWorkspaceCheckpoints(runtime);
	if (!checkpoints.length) return "Vexa Workspace Checkpoints\n--------------------------\nnone";

	return [
		"Vexa Workspace Checkpoints",
		"--------------------------",
		...checkpoints.map(
			(checkpoint, index) =>
				(index + 1) +
			". " +
			checkpoint.filename +
			":" +
			checkpoint.line +
			":" +
			checkpoint.column,
		),
	].join("\n");
}
