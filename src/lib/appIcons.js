/**
 * Available Vexa app icons that can be selected from the settings.
 * The `id` matches the icon names accepted by `system.setAppIcon`.
 * The `image` is a relative path (relative to the www root) to an SVG
 * preview that is rendered inside the UI.
 */

// Update system.java map too if this is updated
export const APP_ICONS = [
	{ id: "default", label: "Default", image: "icons/vexa.svg" },
	{
		id: "pro",
		label: "Vexa Pro",
		image: "icons/vexa.svg",
		requiresPro: true,
	},
	{
		id: "midnight_circuit",
		label: "Midnight Circuit",
		image: "icons/vexa.svg",
	},
	{
		id: "aurora_pulse",
		label: "Aurora Pulse",
		image: "icons/vexa.svg",
	},
	{
		id: "terminal_glow",
		label: "Terminal Glow",
		image: "icons/vexa.svg",
	},
	{
		id: "solar_flare",
		label: "Solar Flare",
		image: "icons/vexa.svg",
	},
	{
		id: "blueprint",
		label: "Blueprint",
		image: "icons/vexa.svg",
	},
	{
		id: "pixel_party",
		label: "Pixel Party",
		image: "icons/vexa.svg",
	},
	{ id: "prism", label: "Prism", image: "icons/vexa.svg" },
	{
		id: "porcelain",
		label: "Porcelain",
		image: "icons/vexa.svg",
	},
	{
		id: "tangerine",
		label: "Tangerine",
		image: "icons/vexa.svg",
	},
	{ id: "tidal", label: "Tidal", image: "icons/vexa.svg" },
	{ id: "lilac", label: "Lilac", image: "icons/vexa.svg" },
	{ id: "volt", label: "Volt", image: "icons/vexa.svg" },
	{ id: "cobalt", label: "Cobalt", image: "icons/vexa.svg" },
	{ id: "glacier", label: "Glacier", image: "icons/vexa.svg" },
];

export const APP_ICON_IDS = APP_ICONS.map((icon) => icon.id);
