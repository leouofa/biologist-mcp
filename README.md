# Biologist Model Context Protocol (MCP) Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.32.2-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A Model Context Protocol (MCP) server providing deep LLM-agent tool, resource, and prompt integrations with **[Biologist](https://github.com/leouofa/biologist)** — an open-source computational research platform and quantitative analytical laboratory for comparative biology, ecology, and organismal taxonomy.

---

## Overview

The `biologist-mcp` server enables AI agents (Claude Code, Cursor, Gemini CLI, Antigravity) to query, manipulate, cluster, and synthesize ecological and taxonomic domain models directly over standard input/output (`stdio`):

- **51 Registered MCP Tools** across 8 functional modules (Search, Biomes, Species, Organisms, Clustering, Synthesis Reports, Background Jobs, and System Diagnostics).
- **4 Registered MCP Resources** exposing read-only live platform status, catalogs, cluster snapshots, and markdown monographs.
- **3 MCP Prompt Templates** for comparative biological studies, cluster synthesis monographs, and evolutionary convergence inquiries.
- **1024-dimensional semantic manifold** querying via PostgreSQL `pgvector` HNSW indexes.

---

## Architectural Mapping

| Tier / Domain | Model | Table Name | MCP Module / Tools |
|---|---|---|---|
| **Tier 1** | Biomes & Climatic Zones | `biomes` | `list_biomes`, `get_biome`, `create_biome`, `update_biome`, `delete_biome`, `upsert_biomes_batch`, `populate_biomes`, `populate_biome_species` |
| **Tier 2** | Species & Keystone Taxa | `species` | `list_species`, `get_species`, `create_species`, `update_species`, `delete_species`, `upsert_species_batch`, `generate_species_embedding`, `populate_species_organisms`, `populate_species_bulk` |
| **Tier 3** | Individual Organisms & Morphs | `organisms` | `list_organisms`, `get_organism`, `create_organism`, `update_organism`, `delete_organism`, `upsert_organisms_batch`, `generate_organism_embedding`, `populate_organisms_bulk` |
| **Clustering** | 15-Level Agglomerative | `cluster_snapshots`, `cluster_groups` | `compute_clusters`, `create_cluster_snapshot`, `list_cluster_snapshots`, `get_cluster_snapshot`, `delete_cluster_snapshot`, `list_cluster_groups`, `get_cluster_group` |
| **Synthesis** | Multi-Stage Map-Reduce | `cluster_reports`, `cluster_report_summaries` | `list_cluster_reports`, `get_cluster_report`, `create_cluster_report`, `delete_cluster_report`, `generate_deep_synthesis`, `list_report_summaries`, `get_report_summary`, `list_report_sub_reports`, `get_report_sub_report` |
| **Global Search** | Cross-Catalog pgvector | Multi-table | `search`, `find_counterparts` |
| **Platform** | Jobs & System Info | Multi-service | `list_jobs`, `get_job_status`, `wait_for_job`, `get_platform_status`, `get_settings`, `update_context_window`, `trigger_bulk_embeddings`, `get_openapi_spec` |

---

## Installation & Setup

### Prerequisites
- Node.js 20+
- Running instance of [Biologist](https://github.com/leouofa/biologist) (`http://localhost:3000`)

### Build
```bash
git clone https://github.com/leouofa/biologist-mcp.git
cd biologist-mcp
npm install
npm run build
```

---

## Configuration

### Environment Variables
Configure via `.env` file or export in your shell:

```bash
# Base URL for the Biologist Rails API (v1)
BIOLOGIST_API_BASE_URL=http://localhost:3000/api/v1

# Optional Bearer Token for protected endpoints
BIOLOGIST_API_TOKEN=

# Request timeout in milliseconds (default: 60000)
BIOLOGIST_TIMEOUT_MS=60000

# Enable debug logging
BIOLOGIST_DEBUG=false
```

### CLI Options
```bash
biologist-mcp [options]

Options:
  -u, --url <url>        Biologist API base URL (default: http://localhost:3000/api/v1)
  -k, --api-key <key>    Optional API key / Bearer token
  -t, --timeout <ms>     Request timeout in milliseconds (default: 60000)
  -d, --debug            Enable debug logging
  -h, --help             Display this help message
```

---

## MCP Client Configuration

### Claude Desktop
Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "biologist": {
      "command": "node",
      "args": ["/path/to/biologist-mcp/dist/index.js"],
      "env": {
        "BIOLOGIST_API_BASE_URL": "http://localhost:3000/api/v1"
      }
    }
  }
}
```

### Antigravity
Add to your `antigravity_config.json` or MCP settings:

```json
{
  "mcpServers": {
    "biologist": {
      "command": "node",
      "args": ["/path/to/biologist-mcp/dist/index.js"],
      "env": {
        "BIOLOGIST_API_BASE_URL": "http://localhost:3000/api/v1"
      }
    }
  }
}
```

---

## MCP Resources

| URI Template | MIME Type | Description |
|---|---|---|
| `biologist://status` | `application/json` | Real-time platform health, counts, and LLM configuration |
| `biologist://biomes` | `application/json` | Catalog of all registered biomes |
| `biologist://snapshots/{id}` | `application/json` | Frozen cluster snapshot data with members and reports |
| `biologist://reports/{id}` | `text/markdown` | Generated synthesis monograph in academic Markdown |

---

## MCP Prompts

1. **`comparative_biological_analysis`**: Rigorous comparative analysis between two species or organisms using semantic manifold distance, trophic strategies, and functional adaptations.
2. **`biological_cluster_monograph`**: Academic synthesis monograph prompt for drafting a formal treatise from frozen archetype clusters.
3. **`evolutionary_convergence_inquiry`**: Cross-biome convergence analysis prompt investigating analog adaptations across independent lineages.

---

## Testing

```bash
# Run test suite
npm test

# Run tests in watch mode
npm run test:watch
```

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
