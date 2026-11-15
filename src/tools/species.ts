import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BiologistApiClient } from "../client/index.js";

export function registerSpeciesTools(server: McpServer, client: BiologistApiClient): void {
  server.tool(
    "list_species",
    "List species registered in Biologist with filtering by biome, themes, embedding status, and search keywords.",
    {
      biome_id: z.number().int().positive().optional().describe("Filter species by Biome ID"),
      theme: z.string().optional().describe("Filter species containing a specific ecological/functional theme tag"),
      q: z.string().optional().describe("Search query matching species name or description"),
      embedded: z.boolean().optional().describe("Filter by embedding presence (true for embedded only, false for missing)"),
      include_organisms: z.boolean().optional().default(false).describe("Include child organisms/morphs in results"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-float vector embedding"),
      limit: z.number().int().min(1).max(500).optional().default(50).describe("Pagination limit (default: 50)"),
      offset: z.number().int().min(0).optional().default(0).describe("Pagination offset (default: 0)")
    },
    async (params) => {
      try {
        const result = await client.listSpecies(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list species: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "get_species",
    "Retrieve details of a single biological species including its biome and child organisms.",
    {
      id: z.number().int().positive().describe("Species ID"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-float vector embedding"),
      include_organisms: z.boolean().optional().default(true).describe("Include child organisms/morphs")
    },
    async ({ id, include_embedding, include_organisms }) => {
      try {
        const species = await client.getSpecies(id, { include_embedding, include_organisms });
        return {
          content: [{ type: "text", text: JSON.stringify(species, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get species ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "create_species",
    "Create a new species record under a parent biome.",
    {
      biome_id: z.number().int().positive().describe("Parent Biome ID"),
      name: z.string().min(1).describe("Name of the species (e.g. 'Panthera leo', 'Snow Leopard')"),
      description: z.string().optional().describe("Morphological, ecological, and behavioral description"),
      themes: z.array(z.string()).optional().describe("Ecological themes and functional adaptations (e.g. ['apex predator', 'hypercarnivore'])")
    },
    async ({ biome_id, name, description, themes }) => {
      try {
        const species = await client.createSpecies({ biome_id, name, description, themes });
        return {
          content: [{ type: "text", text: JSON.stringify(species, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create species: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "update_species",
    "Update an existing species's attributes, biome assignment, or themes.",
    {
      id: z.number().int().positive().describe("Species ID"),
      biome_id: z.number().int().positive().optional().describe("Reassign to a different Biome ID"),
      name: z.string().optional().describe("Updated species name"),
      description: z.string().optional().describe("Updated description"),
      themes: z.array(z.string()).optional().describe("Updated list of themes")
    },
    async ({ id, ...rest }) => {
      try {
        const species = await client.updateSpecies(id, rest);
        return {
          content: [{ type: "text", text: JSON.stringify(species, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to update species ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "delete_species",
    "Delete a species and its associated individual organisms.",
    {
      id: z.number().int().positive().describe("Species ID to delete")
    },
    async ({ id }) => {
      try {
        const res = await client.deleteSpecies(id);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to delete species ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "generate_species_embedding",
    "Generate or refresh the 1024-dimensional semantic embedding for a species.",
    {
      id: z.number().int().positive().describe("Species ID"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for embedding generation")
    },
    async ({ id, sync }) => {
      try {
        const result = await client.generateSpeciesEmbedding(id, { sync });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to generate embedding for species ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_species_organisms",
    "Discover and populate individual organisms, castes, or morphs for a specific species via LLM generation.",
    {
      id: z.number().int().positive().describe("Species ID"),
      count: z.number().int().min(1).max(20).optional().describe("Number of organisms/morphs to discover"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for organism discovery")
    },
    async ({ id, count, sync }) => {
      try {
        const result = await client.populateSpeciesOrganisms(id, { count, sync });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate organisms for species ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_species_bulk",
    "Trigger LLM discovery to populate species across all registered biomes.",
    {},
    async () => {
      try {
        const result = await client.populateSpeciesBulk();
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate bulk species: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "upsert_species_batch",
    "Batch insert or update species scoped to a specific biome matching case-insensitively on name.",
    {
      biome_id: z.number().int().positive().describe("Parent Biome ID"),
      species: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().min(1),
            themes: z.array(z.string()).optional()
          })
        )
        .min(1)
        .describe("Array of species entries to upsert")
    },
    async ({ biome_id, species }) => {
      try {
        const result = await client.upsertSpeciesBatch(biome_id, species);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to upsert species batch: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
