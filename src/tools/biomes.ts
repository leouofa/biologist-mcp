import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BiologistApiClient } from "../client/index.js";

export function registerBiomeTools(server: McpServer, client: BiologistApiClient): void {
  server.tool(
    "list_biomes",
    "List biomes (global ecosystems, climatic zones, and primary environmental regimes) registered in Biologist with species counts.",
    {
      q: z.string().optional().describe("Filter biomes by name or description substring"),
      include_species: z.boolean().optional().default(false).describe("Include species associated with each biome"),
      limit: z.number().int().min(1).max(500).optional().default(50).describe("Pagination limit (default: 50)"),
      offset: z.number().int().min(0).optional().default(0).describe("Pagination offset (default: 0)")
    },
    async ({ q, include_species, limit, offset }) => {
      try {
        const result = await client.listBiomes({ q, include_species, limit, offset });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list biomes: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "get_biome",
    "Retrieve details of a single biome including its member species.",
    {
      id: z.number().int().positive().describe("Biome ID"),
      include_species: z.boolean().optional().default(true).describe("Include species belonging to this biome")
    },
    async ({ id, include_species }) => {
      try {
        const biome = await client.getBiome(id, { include_species });
        return {
          content: [{ type: "text", text: JSON.stringify(biome, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get biome ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "create_biome",
    "Create a new biome record in the catalog.",
    {
      name: z.string().min(1).describe("Name of the biome (e.g. 'Tropical Rainforest', 'Boreal Taiga', 'Hydrothermal Vents')"),
      description: z.string().optional().describe("Climatic, ecological, and environmental description")
    },
    async ({ name, description }) => {
      try {
        const biome = await client.createBiome({ name, description });
        return {
          content: [{ type: "text", text: JSON.stringify(biome, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create biome: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "update_biome",
    "Update an existing biome's name or description.",
    {
      id: z.number().int().positive().describe("Biome ID"),
      name: z.string().optional().describe("Updated biome name"),
      description: z.string().optional().describe("Updated description")
    },
    async ({ id, name, description }) => {
      try {
        const biome = await client.updateBiome(id, { name, description });
        return {
          content: [{ type: "text", text: JSON.stringify(biome, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to update biome ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "delete_biome",
    "Delete a biome and its cascaded species and organisms.",
    {
      id: z.number().int().positive().describe("Biome ID to delete")
    },
    async ({ id }) => {
      try {
        const res = await client.deleteBiome(id);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to delete biome ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "upsert_biomes_batch",
    "Batch insert or update biomes matching case-insensitively on name.",
    {
      biomes: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().min(1)
          })
        )
        .min(1)
        .describe("Array of biomes to upsert")
    },
    async ({ biomes }) => {
      try {
        const result = await client.upsertBiomesBatch(biomes);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to upsert biomes: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_biomes",
    "Trigger LLM discovery to populate major global biomes and environmental regimes.",
    {},
    async () => {
      try {
        const result = await client.populateBiomes();
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate biomes: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_biome_species",
    "Discover and populate canonical species for a specific biome via LLM generation.",
    {
      id: z.number().int().positive().describe("Biome ID"),
      count: z.number().int().min(1).max(20).optional().describe("Number of species to discover"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for species discovery to finish")
    },
    async ({ id, count, sync }) => {
      try {
        const result = await client.populateBiomeSpecies(id, { count, sync });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate species for biome ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
