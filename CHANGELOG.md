# Changelog

All notable changes to `biologist-mcp` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-14

### Added
- Initial release of `biologist-mcp` Model Context Protocol server.
- Full 51-tool suite mirroring the 3-tier comparative biology and organismal taxonomy architecture:
  - Global Search (2 tools): `search`, `find_counterparts`
  - Biomes / Environmental Regimes (8 tools): `list_biomes`, `get_biome`, `create_biome`, `update_biome`, `delete_biome`, `upsert_biomes_batch`, `populate_biomes`, `populate_biome_species`
  - Species & Populations (9 tools): `list_species`, `get_species`, `create_species`, `update_species`, `delete_species`, `upsert_species_batch`, `generate_species_embedding`, `populate_species_organisms`, `populate_species_bulk`
  - Individual Organisms & Castes (8 tools): `list_organisms`, `get_organism`, `create_organism`, `update_organism`, `delete_organism`, `upsert_organisms_batch`, `generate_organism_embedding`, `populate_organisms_bulk`
  - Clusters & Snapshots (7 tools): `compute_clusters`, `create_cluster_snapshot`, `list_cluster_snapshots`, `get_cluster_snapshot`, `delete_cluster_snapshot`, `list_cluster_groups`, `get_cluster_group`
  - Synthesis Reports (9 tools): `list_cluster_reports`, `get_cluster_report`, `create_cluster_report`, `delete_cluster_report`, `generate_deep_synthesis`, `list_report_summaries`, `get_report_summary`, `list_report_sub_reports`, `get_report_sub_report`
  - ActiveJob / Background Tasks (3 tools): `list_jobs`, `get_job_status`, `wait_for_job`
  - System, Status & Configuration (5 tools): `get_platform_status`, `get_settings`, `update_context_window`, `trigger_bulk_embeddings`, `get_openapi_spec`
- 4 MCP Resources: `biologist://status`, `biologist://biomes`, `biologist://snapshots/{id}`, `biologist://reports/{id}`
- 3 MCP Prompts: `comparative_biological_analysis`, `biological_cluster_monograph`, `evolutionary_convergence_inquiry`
- Typed HTTP Client (`BiologistApiClient`) with error mapping (`BiologistApiError`) and polling support (`waitForJob`).
- Complete Vitest test suite with 100% test passing coverage.
