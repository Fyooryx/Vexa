import { describe, expect, it } from "vitest";
import { isTrustedApiRequest } from "../../src/utils/apiSecurity";

const API = "https://service.example/api";
const DOC = "https://vexa.example/editor";

describe("trusted API request classification", () => {
\tit.each([
\t\t["https://service.example/api", true],
\t\t["https://service.example/api/login", true],
\t\t["/api/users", true],
\t\t["https://service.example/apiary", false],
\t\t["https://service.example.evil/api/login", false],
\t\t["https://evil.example/?next=https://service.example/api", false],
\t\t["https://service.example/other", false],
\t])("classifies %s as %s", (url, expected) => {
\t\texpect(isTrustedApiRequest(url, API, DOC)).toBe(expected);
\t});

\tit("rejects malformed URLs", () => {
\t\texpect(isTrustedApiRequest("not a url", API, DOC)).toBe(false);
\t});
});
