import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BiologistApiClient } from "../client/index.js";

export function registerSearchTools(server: McpServer, client: BiologistApiClient): void {
  server.tool(
    "search",
    "Unified cross-catalog semantic or keyword search across species and individual organisms in the Biologist comparative biology manifold.",
    {
      q: z.string().describe("Search query text (e.g. 'deep-sea bioluminescent anglerfish', 'desert nocturnal burrowing rodent')"),
      mode: z.enum(["semantic", "keyword", "auto"]).optional().default("auto").describe("Search mode: semantic (pgvector cosine similarity), keyword (text matching), or auto"),
      target_type: z.enum(["all", "species", "organism"]).optional().default("all").describe("Filter search results by entity type: all, species, or organism"),
      limit: z.number().int().min(1).max(100).optional().default(20).describe("Maximum number of results to return (1-100)")
    },
    async ({ q, mode, target_type, limit }) => {
      try {
        const results = await client.search({ q, mode, target_type, limit });
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Search failed: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "find_counterparts",
    "Find nearest ecological counterparts or convergent evolutionary analogs to a specified species or organism using 1024-dimensional pgvector cosine distance.",
    {
      entity_type: z.enum(["species", "organism"]).describe("Entity type to find counterparts for: species or organism"),
      id: z.number().int().positive().describe("ID of the species or organism"),
      limit: z.number().int().min(1).max(100).optional().default(10).describe("Number of nearest neighbors to return (default: 10)"),
      threshold: z.number().min(0).max(2).optional().describe("Maximum cosine distance threshold")
    },
    async ({ entity_type, id, limit, threshold }) => {
      try {
        if (entity_type === "species") {
          const neighbors = await client.getSpeciesNeighbors(id, { limit, threshold });
          return {
            content: [{ type: "text", text: JSON.stringify(neighbors, null, 2) }]
          };
        } else {
          const neighbors = await client.getOrganismNeighbors(id, { limit, threshold });
          return {
            content: [{ type: "text", text: JSON.stringify(neighbors, null, 2) }]
          };
        }
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Finding counterparts failed: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
