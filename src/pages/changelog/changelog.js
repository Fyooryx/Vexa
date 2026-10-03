import "./style.scss";
import fsOperation from "fileSystem";
import Contextmenu from "components/contextmenu";
import Page from "components/page";
import toast from "components/toast";
import DOMPurify from "dompurify";
import Ref from "html-tag-js/ref";
import actionStack from "lib/actionStack";
import { VEXA_IDENTITY } from "lib/vexaIdentity";
import markdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItTaskLists from "markdown-it-task-lists";
import helpers from "utils/helpers";

const VEXA_REPO_URL = VEXA_IDENTITY.REPOSITORY_URL;
const UPSTREAM_REPO_URL = VEXA_IDENTITY.UPSTREAM_REPOSITORY_URL;
const VEXA_RELEASES_URL = VEXA_IDENTITY.RELEASES_API_URL;
const UPSTREAM_RELEASES_URL = VEXA_IDENTITY.UPSTREAM_RELEASES_API_URL;
const VEXA_CHANGELOG_URL = VEXA_IDENTITY.CHANGELOG_URL;
const UPSTREAM_CHANGELOG_URL = VEXA_IDENTITY.UPSTREAM_CHANGELOG_URL;
const RELEASE_SOURCES = [
	{ releases: VEXA_RELEASES_URL, repository: VEXA_REPO_URL },
	{ releases: UPSTREAM_RELEASES_URL, repository: UPSTREAM_REPO_URL },
];
const CHANGELOG_SOURCES = [
	{ url: VEXA_CHANGELOG_URL, repository: VEXA_REPO_URL },
	{ url: UPSTREAM_CHANGELOG_URL, repository: UPSTREAM_REPO_URL },
];

export default async function Changelog() {
	const currentVersion = BuildInfo.version;

	let selectedVersion = currentVersion;
	let selectedStatus = "current";
	const versionIndicatorRef = Ref();
	const versionTextRef = Ref();
	const body = Ref();

	const versionSelector = (
		<div className="changelog-version-selector" data-action="select-version">
			<span
				className={"status-indicator status-" + selectedStatus}
				ref={versionIndicatorRef}
			></span>
			<span ref={versionTextRef}>{selectedVersion}</span>
		</div>
	);

	const $page = Page(strings["changelog"], {
		tail: versionSelector,
	});

	const versionSelectorMenu = Contextmenu({
		top: "36px",
		right: "5px",
		toggler: versionSelector,
		transformOrigin: "top right",
		onclick: menuClickHandler,
		innerHTML: () => {
			return `
        <li action="current">
          <span class="text">Current Version (${currentVersion})</span>
        </li>
        <li action="latest">
          <span class="text">Latest Release</span>
        </li>
        <li action="beta">
          <span class="text">Beta Version</span>
        </li>
        <li action="full">
          <span class="text">Full Changelog</span>
        </li>
      `;
		},
	});

	const changelogMd = await import("../../../CHANGELOG.md");

	toast("Loading changelog...");
	loadVersionChangelog();
	body.onref = () => renderChangelog(changelogMd.default);
	$page.body = <div className="md" id="changelog" ref={body} />;
	app.append($page);
	helpers.showAd();

	$page.onhide = function () {
		actionStack.remove("changelog");
	};

	actionStack.push({
		id: "changelog",
		action: $page.hide,
	});

	async function loadLatestRelease() {
		try {
			const result = await fetchRelease("/latest");
			selectedVersion = result.release.tag_name.replace(/^v/, "");
			selectedStatus = "latest";
			updateVersionSelector();
			return renderChangelog(result.release.body, result.repository);
		} catch (error) {
			toast("Failed to load latest release notes");
			renderChangelog(changelogMd.default, VEXA_REPO_URL);
		}
	}

	async function loadBetaRelease() {
		try {
			const result = await fetchReleaseList();
			const betaRelease = result.releases.find((release) => release.prerelease);
			if (!betaRelease) {
				body.content = <div className="error">No beta release found</div>;
				return;
			}
			selectedVersion = betaRelease.tag_name.replace(/^v/, "");
			selectedStatus = "prerelease";
			updateVersionSelector();
			return renderChangelog(betaRelease.body, result.repository);
		} catch (error) {
			toast("Failed to load beta release notes");
			renderChangelog(changelogMd.default, VEXA_REPO_URL);
		}
	}

	async function loadFullChangelog() {
		try {
			const result = await fetchText(CHANGELOG_SOURCES);
			const cleanedText = result.text.replace(/^#\s*Change\s*Log\s*\n*/i, "");
			selectedVersion = "Changelogs.md";
			selectedStatus = "current";
			updateVersionSelector();
			return renderChangelog(cleanedText, result.repository);
		} catch (error) {
			toast("Failed to load full changelog");
			renderChangelog(changelogMd.default, VEXA_REPO_URL);
		}
	}

	async function loadVersionChangelog() {
		try {
			const result = await fetchReleaseList();
			const currentRelease = result.releases.find(
				(release) => release.tag_name.replace(/^v/, "") === currentVersion,
			);
			selectedVersion = currentVersion;
			selectedStatus = "current";
			updateVersionSelector();
			if (currentRelease) {
				return renderChangelog(currentRelease.body, result.repository);
			}
			return loadLatestRelease();
		} catch (error) {
			toast("Failed to load version changelog");
			renderChangelog(changelogMd.default, VEXA_REPO_URL);
		}
	}

	async function fetchRelease(path) {
		let lastError;
		for (const source of RELEASE_SOURCES) {
			try {
				const release = await fsOperation(`${source.releases}${path}`).readFile(
					"json",
				);
				return { release, repository: source.repository };
			} catch (error) {
				lastError = error;
			}
		}
		throw lastError || new Error("No release source available");
	}

	async function fetchReleaseList() {
		let lastError;
		for (const source of RELEASE_SOURCES) {
			try {
				const releases = await fsOperation(source.releases).readFile("json");
				return { releases, repository: source.repository };
			} catch (error) {
				lastError = error;
			}
		}
		throw lastError || new Error("No release source available");
	}

	async function fetchText(sources) {
		let lastError;
		for (const source of sources) {
			try {
				const text = await fsOperation(source.url).readFile("utf8");
				return { text, repository: source.repository };
			} catch (error) {
				lastError = error;
			}
		}
		throw lastError || new Error("No changelog source available");
	}

	function renderChangelog(text, repositoryUrl = VEXA_REPO_URL) {
		const md = markdownIt({ html: true, linkify: true });
		let processedText = text
			// Keep upstream and Vexa full PR URLs intact; only bare #numbers need context.
			.replace(/#(?<!\[#)(\d+)(?!\])/g, `[#$1](${repositoryUrl}/pull/$1)`)
			// Convert @username mentions to GitHub profile links.
			.replace(/@(\w+)/g, "[@$1](https://github.com/$1)");

		md.use(markdownItTaskLists);
		md.use(markdownItFootnote);
		const renderedHtml = md.render(processedText);
		body.innerHTML = DOMPurify.sanitize(renderedHtml);
	}

	function updateVersionSelector() {
		versionTextRef.textContent = selectedVersion;
		versionIndicatorRef.className = "status-indicator status-" + selectedStatus;
	}

	async function menuClickHandler(e) {
		const action = e.target.closest("li")?.getAttribute("action");
		if (!action) return;
		versionSelectorMenu.hide();

		switch (action) {
			case "current":
				await loadVersionChangelog();
				break;
			case "latest":
				await loadLatestRelease();
				break;
			case "beta":
				await loadBetaRelease();
				break;
			case "full":
				await loadFullChangelog();
				break;
		}
	}
}
