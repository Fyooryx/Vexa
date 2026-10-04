import fsOperation from "fileSystem";
import settingsPage from "components/settingsPage";
import {
	DEFAULT_TERMINAL_SETTINGS,
	TerminalThemeManager,
} from "components/terminal";
import alert from "dialogs/alert";
import fonts from "lib/fonts";
import appSettings from "lib/settings";

export default function terminalSettings() {
	const title = strings["terminal settings"];
	const values = appSettings.value;
	const categories = {
		permissions: strings["settings-category-permissions"],
		display: strings["settings-category-display"],
		cursor: strings["settings-category-cursor"],
		session: strings["settings-category-session"],
		maintenance: strings["settings-category-maintenance"],
	};

	// Initialize terminal settings with defaults if not present
	if (!values.terminalSettings) {
		values.terminalSettings = {
			...DEFAULT_TERMINAL_SETTINGS,
			fontFamily:
				DEFAULT_TERMINAL_SETTINGS.fontFamily || appSettings.value.fontFamily,
		};
	}

	const terminalValues = values.terminalSettings;


	const items = [
		{
			key: "all_file_access",
			text: strings["allFileAccess"],
			info: strings["info-all_file_access"],
			category: categories.permissions,
			chevron: true,
		},
		{
			key: "fontSize",
			text: strings["font size"],
			value: terminalValues.fontSize,
			prompt: strings["font size"],
			promptType: "number",
			promptOptions: {
				test(value) {
					value = Number.parseInt(value);
					return value >= 8 && value <= 32;
				},
			},
			info: strings["info-fontSize"],
			category: categories.display,
		},
		{
			key: "fontFamily",
			text: strings["terminal:font family"],
			value: terminalValues.fontFamily,
			get select() {
				return fonts.getNames();
			},
			info: strings["info-fontFamily"],
			category: categories.display,
		},
		{
			key: "fontWeight",
			text: strings["terminal:font weight"],
			value: terminalValues.fontWeight,
			valueText: (value) => {
				const tuple = [
					["normal", strings["terminal:normal"]],
					["bold", strings["terminal:bold"]],
				].find((item) => item[0] === value);

				return tuple ? tuple[1] : value;
			},
			select: [
				["normal", strings["terminal:normal"]],
				["bold", strings["terminal:bold"]],
				"100",
				"200",
				"300",
				"400",
				"500",
				"600",
				"700",
				"800",
				"900",
			],
			info: strings["info-fontWeight"],
			category: categories.display,
		},

		{
			key: "letterSpacing",
			text: strings["letter spacing"],
			value: terminalValues.letterSpacing,
			prompt: strings["letter spacing"],
			promptType: "number",
			info: strings["info-letterSpacing"],
			category: categories.display,
		},
		{
			key: "fontLigatures",
			text: strings["font ligatures"],
			checkbox: terminalValues.fontLigatures,
			info: strings["info-fontLigatures"],
			category: categories.display,
		},
		{
			key: "showScrollbar",
			text: strings["terminal:show scrollbar"] || "Show Scrollbar",
			checkbox: terminalValues.showScrollbar !== false,
			info:
				strings["info-terminal-show-scrollbar"] ||
				"Show the xterm scrollbar beside the terminal.",
			category: categories.display,
		},
		{
			key: "cursorStyle",
			text: strings["terminal:cursor style"],
			value: terminalValues.cursorStyle,
			valueText: (value) => {
				const option = [
					["block", strings["terminal:block"]],
					["underline", strings["terminal:underline"]],
					["bar", strings["terminal:bar"]],
				].find((item) => item[0] === value);
				return option ? option[1] : value;
			},
			select: [
				["block", strings["terminal:block"]],
				["underline", strings["terminal:underline"]],
				["bar", strings["terminal:bar"]],
			],
			info: strings["info-cursorStyle"],
			category: categories.cursor,
		},
		{
			key: "cursorInactiveStyle",
			text: strings["terminal:cursor inactive style"],
			value: terminalValues.cursorInactiveStyle,
			valueText: (value) => {
				const options = [
					["outline", strings["terminal:inactive outline"]],
					["block", strings["terminal:inactive block"]],
					["underline", strings["terminal:inactive underline"]],
					["bar", strings["terminal:inactive bar"]],
					["none", strings["terminal:inactive none"]],
				];
				const option = options.find((item) => item[0] === value);
				return option ? option[1] : value;
			},
			select: [
				["outline", strings["terminal:inactive outline"]],
				["block", strings["terminal:inactive block"]],
				["underline", strings["terminal:inactive underline"]],
				["bar", strings["terminal:inactive bar"]],
				["none", strings["terminal:inactive none"]],
			],
			info: strings["info-cursorInactiveStyle"],
			category: categories.cursor,
		},
		{
			key: "cursorBlink",
			text: strings["terminal:cursor blink"],
			checkbox: terminalValues.cursorBlink,
			info: strings["info-cursorBlink"],
			category: categories.cursor,
		},
		{
			key: "scrollback",
			text: strings["terminal:scrollback"],
			value: terminalValues.scrollback,
			prompt: strings["terminal:scrollback"],
			promptType: "number",
			promptOptions: {
				test(value) {
					value = Number.parseInt(value);
					return value >= 100 && value <= 10000;
				},
			},
			info: strings["info-scrollback"],
			category: categories.session,
		},
		{
			key: "tabStopWidth",
			text: strings["terminal:tab stop width"],
			value: terminalValues.tabStopWidth,
			prompt: strings["terminal:tab stop width"],
			promptType: "number",
			promptOptions: {
				test(value) {
					value = Number.parseInt(value);
					return value >= 1 && value <= 8;
				},
			},
			info: strings["info-tabStopWidth"],
			category: categories.session,
		},
		{
			key: "convertEol",
			text: strings["terminal:convert eol"],
			checkbox: terminalValues.convertEol,
			info: strings["settings-info-terminal-convert-eol"],
			category: categories.session,
		},
		{
			key: "imageSupport",
			text: strings["terminal:image support"],
			checkbox: terminalValues.imageSupport,
			info: strings["info-imageSupport"],
			category: categories.session,
		},
		{
			key: "confirmTabClose",
			text: strings["terminal:confirm tab close"],
			checkbox: terminalValues.confirmTabClose !== false,
			info: strings["info-confirmTabClose"],
			category: categories.session,
		},
		{
			key: "termuxAutoOpen",
			text: "Open Termux automatically",
			checkbox: terminalValues.termuxAutoOpen !== false,
			info: "Open a new interactive Termux shell when the Vexa terminal tab is created.",
			category: categories.maintenance,
		},
		{
			key: "openTermux",
			text: "Open Termux",
			info: "Launch the installed Termux application.",
			category: categories.maintenance,
			chevron: true,
		},
	];

	return settingsPage(title, items, callback, undefined, {
		preserveOrder: true,
		pageClassName: "detail-settings-page",
		listClassName: "detail-settings-list",
		infoAsDescription: true,
		valueInTail: true,
	});

	/**
	 * Callback for settings page when an item is clicked
	 * @param {string} key
	 * @param {string} value
	 */
	async function callback(key, value) {
		switch (key) {
			case "all_file_access":
				if (ANDROID_SDK_INT >= 30) {
					system.isManageExternalStorageDeclared((boolStr) => {
						if (boolStr === "true") {
							system.requestStorageManager(console.log, console.error);
						} else {
							alert(strings["feature not available"]);
						}
					}, alert);
				} else {
					alert(strings["feature not available"]);
				}
				return;

			case "openTermux":
				try {
					if (typeof Terminal === "undefined" || !(await Terminal.isInstalled())) {
						alert(
							"Termux",
							"Termux is not installed. Install Termux before using the Vexa terminal.",
						);
						return;
					}
					await Terminal.openSession(terminalValues.termuxWorkdir || "~");
				} catch (error) {
					console.error("Failed to open Termux:", error);
					alert("Termux", error?.message || "Unable to open Termux.");
				}
				return;

			default:
				appSettings.update({
					terminalSettings: {
						...values.terminalSettings,
						[key]: value,
					},
				});
				updateActiveTerminals(key, value);
				return;
		}
	}

}

/**
 * Update active terminal instances with new settings
 * @param {string} key
 * @param {any} value
 */
export async function updateActiveTerminals(key, value) {
	// Find all terminal tabs and update their settings
	const terminalTabs = editorManager.files.filter(
		(file) => file.type === "terminal",
	);

	terminalTabs.forEach(async (tab) => {
		if (tab.terminalComponent) {
			const terminalOptions = {};

			switch (key) {
				case "fontSize":
					tab.terminalComponent.terminal.options.fontSize = value;
					break;
				case "fontFamily":
					// Load font if it's not already loaded
					try {
						fonts.injectFontFace(value);
						await fonts.loadFont(value);
					} catch (error) {
						console.warn(`Failed to load font ${value}:`, error);
					}
					tab.terminalComponent.terminal.options.fontFamily = value;
					tab.terminalComponent.terminal.refresh(
						0,
						tab.terminalComponent.terminal.rows - 1,
					);
					break;
				case "fontWeight":
					tab.terminalComponent.terminal.options.fontWeight = value;
					break;
				case "cursorBlink":
					tab.terminalComponent.terminal.options.cursorBlink = value;
					break;
				case "cursorStyle":
					tab.terminalComponent.terminal.options.cursorStyle = value;
					break;
				case "cursorInactiveStyle":
					tab.terminalComponent.terminal.options.cursorInactiveStyle = value;
					break;
				case "scrollback":
					tab.terminalComponent.terminal.options.scrollback = value;
					break;
				case "showScrollbar":
					tab.terminalComponent.updateScrollbarVisibility(value);
					break;
				case "tabStopWidth":
					tab.terminalComponent.terminal.options.tabStopWidth = value;
					break;
				case "convertEol":
					tab.terminalComponent.terminal.options.convertEol = value;
					break;
				case "letterSpacing":
					tab.terminalComponent.terminal.options.letterSpacing = value;
					break;
				case "theme":
					tab.terminalComponent.terminal.options.theme =
						TerminalThemeManager.getTheme(value);
					tab.terminalComponent.updateBackgroundColor();
					break;
				case "imageSupport":
					tab.terminalComponent.updateImageSupport(value);
					break;
				case "fontLigatures":
					tab.terminalComponent.updateFontLigatures(value);
					break;
			}
		}
	});
}
