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
		image: "icons/vexa_pro.svg",
		requiresPro: true,
	},
	{
		id: "midnight_circuit",
		label: "Midnight Circuit",
		image: "icons/vexa_midnight_circuit.svg",
	},
	{
		id: "aurora_pulse",
		label: "Aurora Pulse",
		image: "icons/vexa_aurora_pulse.svg",
	},
	{
		id: "terminal_glow",
		label: "Terminal Glow",
		image: "icons/vexa_terminal_glow.svg",
	},
	{
		id: "solar_flare",
		label: "Solar Flare",
		image: "icons/vexa_solar_flare.svg",
	},
	{
		id: "blueprint",
		label: "Blueprint",
		image: "icons/vexa_blueprint.svg",
	},
	{
		id: "pixel_party",
		label: "Pixel Party",
		image: "icons/vexa_pixel_party.svg",
	},
	{ id: "prism", label: "Prism", image: "icons/vexa_prism.svg" },
	{
		id: "porcelain",
		label: "Porcelain",
		image: "icons/vexa_porcelain.svg",
	},
	{
		id: "tangerine",
		label: "Tangerine",
		image: "icons/vexa_tangerine.svg",
	},
	{ id: "tidal", label: "Tidal", image: "icons/vexa_tidal.svg" },
	{ id: "lilac", label: "Lilac", image: "icons/vexa_lilac.svg" },
	{ id: "volt", label: "Volt", image: "icons/vexa_volt.svg" },
	{ id: "cobalt", label: "Cobalt", image: "icons/vexa_cobalt.svg" },
	{ id: "glacier", label: "Glacier", image: "icons/vexa_glacier.svg" },
];

export const APP_ICON_IDS = APP_ICONS.map((icon) => icon.id);
