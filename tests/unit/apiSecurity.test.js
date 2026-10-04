import { describe, expect, it } from "vitest";
import { isTrustedApiRequest } from "../../src/utils/apiSecurity";

const API = "https://service.example/api";
const DOC = "https://service.example/editor";

describe("trusted API request classification", () => {
  it.each([
    ["https://service.example/api", true],
    ["https://service.example/api/login", true],
    ["/api/users", true],
    ["https://service.example/apiary", false],
    ["https://service.example.evil/api/login", false],
    ["https://evil.example/?next=https://service.example/api", false],
    ["https://service.example/other", false],
  ])("classifies %s as %s", (url, expected) => {
    expect(isTrustedApiRequest(url, API, DOC)).toBe(expected);
  });

  it("rejects malformed URLs", () => {
    expect(isTrustedApiRequest("not a url", API, DOC)).toBe(false);
  });
});
