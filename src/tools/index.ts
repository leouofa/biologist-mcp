import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BiologistApiClient } from "../client/index.js";
import { registerSearchTools } from "./search.js";
import { registerBiomeTools } from "./biomes.js";
import { registerSpeciesTools } from "./species.js";
import { registerOrganismTools } from "./organisms.js";
import { registerClusterTools } from "./clusters.js";
import { registerReportTools } from "./reports.js";
import { registerJobTools } from "./jobs.js";
import { registerSystemTools } from "./system.js";

export function registerAllTools(server: McpServer, client: BiologistApiClient): void {
  registerSearchTools(server, client);
  registerBiomeTools(server, client);
  registerSpeciesTools(server, client);
  registerOrganismTools(server, client);
  registerClusterTools(server, client);
  registerReportTools(server, client);
  registerJobTools(server, client);
  registerSystemTools(server, client);
}
