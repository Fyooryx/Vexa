import { describe, expect, it } from "vitest";
import {
	isUpstreamApiUrl,
	isVexaDeepLink,
	VEXA_IDENTITY,
} from "../../src/lib/vexaIdentity";

describe("Vexa identity boundaries", () => {
	it("recognizes both Vexa and legacy deep-link schemes", () => {
		expect(isVexaDeepLink("vexa://auth/callback")).toBe(true);
		expect(isVexaDeepLink("acode://auth/callback")).toBe(true);
		expect(isVexaDeepLink("https://example.com/auth/callback")).toBe(false);
		expect(isVexaDeepLink("not-a-url")).toBe(false);
	});

	it("recognizes only the configured upstream API origin and path", () => {
		const api = `${VEXA_IDENTITY.UPSTREAM_SERVICE_URL}/api/me`;
		expect(isUpstreamApiUrl(api)).toBe(true);
		expect(isUpstreamApiUrl("https://acode.app/apix/me")).toBe(false);
		expect(isUpstreamApiUrl("https://evil.example/api/me")).toBe(false);
		expect(isUpstreamApiUrl("not-a-url")).toBe(false);
		expect(isUpstreamApiUrl("https://acode.app.evil.example/api/me")).toBe(false);
	});

	it("keeps the canonical application identity stable", () => {
		expect(VEXA_IDENTITY.NAME).toBe("Vexa");
		expect(VEXA_IDENTITY.PACKAGE_NAME).toBe("com.vexa.app");
		expect(VEXA_IDENTITY.URL_SCHEME).toBe("vexa");
		expect(VEXA_IDENTITY.LEGACY_URL_SCHEME).toBe("acode");
	});
});
