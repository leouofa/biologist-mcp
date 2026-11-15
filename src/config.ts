import dotenv from "dotenv";

dotenv.config({ quiet: true });

export interface ServerConfig {
  apiUrl: string;
  apiKey?: string;
  timeoutMs: number;
  debug: boolean;
}

export function parseArgs(argv: string[] = process.argv.slice(2)): Partial<ServerConfig> & { showHelp?: boolean } {
  const result: Partial<ServerConfig> & { showHelp?: boolean } = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      result.showHelp = true;
    } else if (arg === "--url" || arg === "-u") {
      result.apiUrl = argv[++i];
    } else if (arg === "--api-key" || arg === "-k" || arg === "--token") {
      result.apiKey = argv[++i];
    } else if (arg === "--timeout" || arg === "-t") {
      const ms = parseInt(argv[++i], 10);
      if (!isNaN(ms) && ms > 0) {
        result.timeoutMs = ms;
      }
    } else if (arg === "--debug" || arg === "-d") {
      result.debug = true;
    }
  }

  return result;
}

export function loadConfig(argv: string[] = process.argv.slice(2)): ServerConfig & { showHelp?: boolean } {
  const args = parseArgs(argv);

  const envUrl = process.env.BIOLOGIST_API_BASE_URL || process.env.BIOLOGIST_API_URL;
  const envKey = process.env.BIOLOGIST_API_TOKEN || process.env.BIOLOGIST_API_KEY;
  const envTimeout = process.env.BIOLOGIST_TIMEOUT_MS ? parseInt(process.env.BIOLOGIST_TIMEOUT_MS, 10) : undefined;
  const envDebug = process.env.BIOLOGIST_DEBUG === "true" || process.env.BIOLOGIST_DEBUG === "1";

  const apiUrl = (args.apiUrl || envUrl || "http://localhost:3000/api/v1").replace(/\/+$/, "");
  const apiKey = args.apiKey || envKey || undefined;
  const timeoutMs =
    args.timeoutMs || (!isNaN(envTimeout as number) && (envTimeout as number) > 0 ? (envTimeout as number) : 60000);
  const debug = args.debug ?? envDebug;

  return {
    apiUrl,
    apiKey,
    timeoutMs,
    debug,
    showHelp: args.showHelp
  };
}

export const HELP_TEXT = `
Biologist Model Context Protocol (MCP) Server

Usage:
  biologist-mcp [options]

Options:
  -u, --url <url>        Biologist API base URL (default: http://localhost:3000/api/v1)
  -k, --api-key <key>    Optional API key / Bearer token
  -t, --timeout <ms>     Request timeout in milliseconds (default: 60000)
  -d, --debug            Enable debug logging
  -h, --help             Display this help message

Environment Variables:
  BIOLOGIST_API_BASE_URL  Biologist API base URL (or BIOLOGIST_API_URL)
  BIOLOGIST_API_TOKEN     Optional API key / Bearer token (or BIOLOGIST_API_KEY)
  BIOLOGIST_TIMEOUT_MS    Request timeout in milliseconds (default: 60000)
  BIOLOGIST_DEBUG         Enable debug logging (true/false)
`;
