import { describe, it, expect } from "vitest";
import { parseArgs, loadConfig } from "../src/config.js";

describe("Server Config & CLI Parsing", () => {
  it("parses CLI flags correctly", () => {
    const config = parseArgs([
      "--url",
      "https://biologist.example.com/api/v1",
      "--api-key",
      "secret-token",
      "--timeout",
      "30000",
      "--debug"
    ]);

    expect(config.apiUrl).toBe("https://biologist.example.com/api/v1");
    expect(config.apiKey).toBe("secret-token");
    expect(config.timeoutMs).toBe(30000);
    expect(config.debug).toBe(true);
  });

  it("handles shorthand CLI flags", () => {
    const config = parseArgs(["-u", "http://biologist-local:3000/api/v1", "-k", "tok", "-t", "45000", "-d", "-h"]);
    expect(config.apiUrl).toBe("http://biologist-local:3000/api/v1");
    expect(config.apiKey).toBe("tok");
    expect(config.timeoutMs).toBe(45000);
    expect(config.debug).toBe(true);
    expect(config.showHelp).toBe(true);
  });

  it("falls back to default apiUrl and timeoutMs", () => {
    const config = loadConfig([]);
    expect(config.apiUrl).toBe("http://localhost:3000/api/v1");
    expect(config.timeoutMs).toBe(60000);
    expect(config.debug).toBe(false);
  });
});
