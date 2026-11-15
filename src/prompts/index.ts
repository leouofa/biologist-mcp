import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.prompt(
    "comparative_biological_analysis",
    "Prompt template for comparing two biological species or organisms across biomes using morphological traits, trophic strategies, and semantic manifold distance.",
    {
      entity_a: z.string().describe("First species or organism name (e.g. 'Snow Leopard' or 'Polar Bear Adult Male')"),
      entity_b: z.string().describe("Second species or organism name (e.g. 'Fennec Fox' or 'Cheetah')"),
      entity_type: z
        .enum(["species", "organism"])
        .optional()
        .default("species")
        .describe("Entity type to compare: species or organism (default: species)"),
      focus_theme: z
        .string()
        .optional()
        .describe("Optional thematic lens (e.g. 'thermoregulatory adaptation', 'hunting strategy', 'water conservation')")
    },
    ({ entity_a, entity_b, entity_type = "species", focus_theme }) => {
      const themeInstruction = focus_theme
        ? `Focus specifically through the thematic lens of: "${focus_theme}".`
        : "Analyze shared evolutionary lineages, morphological adaptations, trophic strategies, and ecological niche specializations.";

      const detailTool = entity_type === "organism" ? "get_organism" : "get_species";

      return {
        description: `Comparative biological analysis of ${entity_a} vs. ${entity_b}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Please conduct a rigorous comparative biological and ecological analysis between ${entity_a} and ${entity_b} (${entity_type}) using the Biologist computational framework.\n\n` +
                `1. Query Biologist using the 'search' and '${detailTool}' tools to retrieve their structured profiles, thematic tags, and biome context.\n` +
                `2. Use 'find_counterparts' (entity_type='${entity_type}') to examine where each falls on the 1024-dimensional pgvector cosine distance manifold.\n` +
                `3. ${themeInstruction}\n` +
                `4. Cite specific thematic tags, phenotypic parameters, cosine distances, and cross-biome adaptive parallels.`
            }
          }
        ]
      };
    }
  );

  server.prompt(
    "biological_cluster_monograph",
    "Prompt template to draft an academic biological treatise based on Biologist archetype clusters and frozen snapshots.",
    {
      snapshot_id: z.string().describe("ID of the frozen cluster snapshot to synthesize"),
      thematic_prompt: z.string().describe("Biological, evolutionary, or ecological research inquiry to address")
    },
    ({ snapshot_id, thematic_prompt }) => {
      return {
        description: `Biological synthesis monograph based on Snapshot #${snapshot_id}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `You are an expert evolutionary biologist and ecological systems researcher specializing in organismal taxonomy, phenotypic manifolds, and cross-biome synthesis.\n\n` +
                `Research Inquiry: "${thematic_prompt}"\n\n` +
                `1. Inspect cluster snapshot #${snapshot_id} using 'get_cluster_snapshot' or resource 'biologist://snapshots/${snapshot_id}'.\n` +
                `2. Examine the discovered archetype cluster groups, shared ecological themes, and constituent species or individual organisms.\n` +
                `3. Check if any synthesis reports exist via 'list_cluster_reports' or initiate a new report via 'create_cluster_report' (and optionally 'generate_deep_synthesis').\n` +
                `4. Compose an academic monograph synthesizing the cross-biome patterns with formal citations to cluster numbers and member taxa.`
            }
          }
        ]
      };
    }
  );

  server.prompt(
    "evolutionary_convergence_inquiry",
    "Prompt template for investigating convergent evolutionary adaptations across disparate biomes.",
    {
      adaptation_trait: z.string().describe("Target adaptive trait or evolutionary innovation (e.g. 'bioluminescence', 'fossorial burrowing', 'hypercarnivory')"),
      target_type: z.enum(["Species", "Organism"]).optional().default("Species").describe("Entity level to examine: Species or Organism")
    },
    ({ adaptation_trait, target_type = "Species" }) => {
      return {
        description: `Evolutionary convergence inquiry into ${adaptation_trait}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `You are an evolutionary ecologist studying convergent evolution across global ecosystems.\n\n` +
                `Adaptive Trait Inquiry: "${adaptation_trait}" across ${target_type} records.\n\n` +
                `1. Search for entities exhibiting this adaptation using 'search' (mode='semantic' or 'auto') and query '${adaptation_trait}'.\n` +
                `2. Identify the disparate biomes in which these lineages evolved.\n` +
                `3. Compute or examine archetype clusters across granularity levels (levels 3-8) using 'compute_clusters' with target_type='${target_type}'.\n` +
                `4. Evaluate whether these adaptations represent homologous traits from shared ancestry or independent evolutionary convergence, citing specific cosine distances and phenotypic parameters.`
            }
          }
        ]
      };
    }
  );
}
