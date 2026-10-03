#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = import.meta.dirname;
const workflowsDir = path.join(root, "..", ".github", "workflows");

function fail(message) {
	console.error(`[Vexa workflows] FAIL: ${message}`);
	throw new Error(message);
}

function expect(condition, message) {
	if (!condition) fail(message);
}

function walk(dir) {
	if (!fs.existsSync(dir)) return [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		if (entry.name.startsWith(".")) continue;
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...walk(full));
		else if (/\.ya?ml$/i.test(entry.name)) files.push(full);
	}
	return files;
}

const workflowFiles = walk(workflowsDir);
expect(workflowFiles.length > 0, "no GitHub workflow files were found");

const usesPattern = /^\s*(?:-\s*)?uses:\s*([^\s#]+)\s*$/gm;
const unpinned = [];

for (const file of workflowFiles) {
	const content = fs.readFileSync(file, "utf8");
	let match;
	while ((match = usesPattern.exec(content)) !== null) {
		const reference = match[1];
		if (reference.startsWith("./") || reference.startsWith("docker://"))
			continue;
		const at = reference.lastIndexOf("@");
		if (at <= 0 || !/^[0-9a-f]{40}$/i.test(reference.slice(at + 1))) {
			unpinned.push({
				file: path.relative(path.join(root, ".."), file),
				reference,
			});
		}
	}
}

expect(
	unpinned.length === 0,
	`third-party GitHub Actions must be pinned to immutable commit SHAs: ${unpinned
			.map(({ file, reference }) => `${file} -> ${reference}`)
		.join("; ")}`,
);

console.log(
	`[Vexa workflows] PASS | Workflow files checked: ${workflowFiles.length} | All third-party actions are commit-pinned`,
);
