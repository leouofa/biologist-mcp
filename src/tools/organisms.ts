import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BiologistApiClient } from "../client/index.js";

export function registerOrganismTools(server: McpServer, client: BiologistApiClient): void {
  server.tool(
    "list_organisms",
    "List individual organisms (morphs, castes, sexual dimorphisms, life-history stages) with filtering by species, biome, themes, and embedding status.",
    {
      species_id: z.number().int().positive().optional().describe("Filter organisms by Species ID"),
      biome_id: z.number().int().positive().optional().describe("Filter organisms by Biome ID"),
      theme: z.string().optional().describe("Filter organisms containing a specific ecological/phenotypic theme tag"),
      q: z.string().optional().describe("Search query matching organism name or description"),
      embedded: z.boolean().optional().describe("Filter by embedding presence (true for embedded only, false for missing)"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-float vector embedding"),
      limit: z.number().int().min(1).max(500).optional().default(50).describe("Pagination limit (default: 50)"),
      offset: z.number().int().min(0).optional().default(0).describe("Pagination offset (default: 0)")
    },
    async (params) => {
      try {
        const result = await client.listOrganisms(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list organisms: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "get_organism",
    "Retrieve details of a single individual organism including parent species and biome.",
    {
      id: z.number().int().positive().describe("Organism ID"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-float vector embedding")
    },
    async ({ id, include_embedding }) => {
      try {
        const organism = await client.getOrganism(id, { include_embedding });
        return {
          content: [{ type: "text", text: JSON.stringify(organism, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get organism ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "create_organism",
    "Create a new individual organism/morph record under a parent species.",
    {
      species_id: z.number().int().positive().describe("Parent Species ID"),
      name: z.string().min(1).describe("Name or designation of the organism (e.g. 'Adult Male Pride Leader', 'Major Soldier Worker')"),
      description: z.string().optional().describe("Phenotypic, behavioral, or caste description"),
      themes: z.array(z.string()).optional().describe("Phenotypic themes and traits (e.g. ['sexual dimorphism', 'territorial defense'])")
    },
    async ({ species_id, name, description, themes }) => {
      try {
        const organism = await client.createOrganism({ species_id, name, description, themes });
        return {
          content: [{ type: "text", text: JSON.stringify(organism, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create organism: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "update_organism",
    "Update an existing organism's attributes, species assignment, or themes.",
    {
      id: z.number().int().positive().describe("Organism ID"),
      species_id: z.number().int().positive().optional().describe("Reassign to a different Species ID"),
      name: z.string().optional().describe("Updated organism name"),
      description: z.string().optional().describe("Updated description"),
      themes: z.array(z.string()).optional().describe("Updated list of themes")
    },
    async ({ id, ...rest }) => {
      try {
        const organism = await client.updateOrganism(id, rest);
        return {
          content: [{ type: "text", text: JSON.stringify(organism, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to update organism ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "delete_organism",
    "Delete an individual organism record.",
    {
      id: z.number().int().positive().describe("Organism ID to delete")
    },
    async ({ id }) => {
      try {
        const res = await client.deleteOrganism(id);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to delete organism ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "generate_organism_embedding",
    "Generate or refresh the 1024-dimensional semantic embedding for an individual organism.",
    {
      id: z.number().int().positive().describe("Organism ID"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for embedding generation")
    },
    async ({ id, sync }) => {
      try {
        const result = await client.generateOrganismEmbedding(id, { sync });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to generate embedding for organism ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_organisms_bulk",
    "Trigger LLM discovery to populate individual organisms across all registered species.",
    {},
    async () => {
      try {
        const result = await client.populateOrganismsBulk();
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate bulk organisms: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "upsert_organisms_batch",
    "Batch insert or update organisms scoped to a specific species matching case-insensitively on name.",
    {
      species_id: z.number().int().positive().describe("Parent Species ID"),
      organisms: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().min(1),
            themes: z.array(z.string()).optional()
          })
        )
        .min(1)
        .describe("Array of organism entries to upsert")
    },
    async ({ species_id, organisms }) => {
      try {
        const result = await client.upsertOrganismsBatch(species_id, organisms);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to upsert organisms batch: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
