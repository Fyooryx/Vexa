import { getResolvedKeyBindings } from "cm/commandRegistry";
import logoSrc from "components/logo/logo.png?inline";
import config from "lib/config";
import EditorFile from "lib/editorFile";
import { vexaExec } from "lib/vexaApi";

/**
 * Opens the Welcome tab as an EditorFile page
 */
export default function openWelcomeTab() {
	// Check if welcome tab is already open
	const existingFile = editorManager.files.find((f) => f.id === "welcome-tab");
	if (existingFile) {
		existingFile.makeActive();
		return;
	}

	const welcomeContent = createWelcomeContent();

	const welcomeFile = new EditorFile("Welcome", {
		id: "welcome-tab",
		render: true,
		type: "page",
		content: welcomeContent,
		tabIcon: "icon vexa",
		hideQuickTools: true,
	});

	// Set custom subtitle for the header
	welcomeFile.setCustomTitle(() => "Get Started");
}

/**
 * Creates the welcome tab content
 * @returns {HTMLElement}
 */
function createWelcomeContent() {
	const bindings = getResolvedKeyBindings();
	const kb = (name) => {
		const binding = bindings[name];
		return binding?.key ? binding.key.split("|")[0].replace(/-/g, "+") : "";
	};

	return (
		<div id="welcome-tab" className="welcome-page scroll">
			{/* Hero Section */}
			<header className="welcome-header">
				<img className="logo" src={logoSrc} width="48" height="48" alt="" />
				<div className="welcome-header-text">
					<h1>Welcome to Vexa</h1>
					<p className="tagline">Powerful code editor for Android</p>
				</div>
			</header>

			{/* Get Started Section */}
			<section className="welcome-section">
				<h2 className="section-label">GET STARTED</h2>
				<div className="action-list">
					<ActionRow
						icon="add"
						label={strings["new file"]}
						shortcut={kb("newFile")}
						onClick={() => vexaExec("new-file")}
					/>
					<ActionRow
						icon="document-text-outline"
						label={strings["open file"]}
						shortcut={kb("openFile")}
						onClick={() => vexaExec("open-file")}
					/>
					<ActionRow
						icon="folder_open"
						label={strings["open folder"]}
						shortcut={kb("openFolder")}
						onClick={() => vexaExec("open-folder")}
					/>
					<ActionRow
						icon="terminal"
						label={strings.terminal}
						shortcut={kb("openTerminal")}
						onClick={() => vexaExec("new-terminal")}
					/>
					<ActionRow
						icon="historyrestore"
						label={strings.recent}
						onClick={() => vexaExec("recent")}
					/>
					<ActionRow
						icon="tune"
						label={strings["command palette"]}
						shortcut={kb("openCommandPalette")}
						onClick={() => vexaExec("command-palette")}
					/>
				</div>
			</section>

			{/* Configure Section */}
			<section className="welcome-section">
				<h2 className="section-label">CONFIGURE</h2>
				<div className="action-list">
					<ActionRow
						icon="settings"
						label={strings.settings}
						onClick={() => vexaExec("open", "settings")}
					/>
					<ActionRow
						icon="color_lenspalette"
						label={strings["change theme"]}
						onClick={() => vexaExec("change-app-theme")}
					/>
					<ActionRow
						icon="extension"
						label={strings.explore + " " + strings.plugins}
						onClick={() => vexaExec("open", "plugins")}
					/>
				</div>
			</section>

			{/* Learn Section */}
			<section className="welcome-section">
				<h2 className="section-label">LEARN</h2>
				<div className="action-list">
					<ActionRow
						icon="help"
						label={strings.help}
						onClick={() => vexaExec("open", "help")}
					/>
					<ActionRow
						icon="info_outline"
						label={strings.about}
						onClick={() => vexaExec("open", "about")}
					/>
				</div>
			</section>

			{/* Links Section */}
			<section className="welcome-section welcome-links">
				<h2 className="section-label">CONNECT</h2>
				<div className="link-row">
					<LinkItem icon="vexa" label="Website" url={config.BASE_URL} />
					<LinkItem icon="github" label="GitHub" url={config.GITHUB_URL} />
					<LinkItem icon="discord" label="Discord" url={config.DISCORD_URL} />
				</div>
			</section>
		</div>
	);
}

/**
 * Action row component
 */
function ActionRow({ icon, label, shortcut, onClick }) {
	return (
		<div className="action-row" onclick={onClick}>
			<span className={`icon ${icon}`}></span>
			<span className="action-label">{label}</span>
			{shortcut && <span className="action-shortcut">{shortcut}</span>}
		</div>
	);
}

/**
 * Link item component - opens URL in external browser
 */
function LinkItem({ icon, label, url }) {
	const handleClick = (e) => {
		e.preventDefault();
		system.openInBrowser(url);
	};

	return (
		<a href={url} className="link-item" onclick={handleClick}>
			<span className={`icon ${icon}`}></span>
			<span>{label}</span>
		</a>
	);
}
