import { describe, it, expect, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { BiologistApiClient, BiologistApiError } from "../src/client/index.js";

describe("BiologistApiClient", () => {
  let mock: MockAdapter;
  let client: BiologistApiClient;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    client = new BiologistApiClient({
      apiUrl: "http://localhost:3000/api/v1",
      timeoutMs: 5000,
      debug: false
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it("fetches platform status successfully", async () => {
    const mockStatus = {
      status: "ok",
      environment: "test",
      timestamp: "2026-11-14T00:00:00Z",
      counts: {
        biomes: 8,
        species: 120,
        species_embedded: 120,
        organisms: 450,
        organisms_embedded: 450,
        cluster_snapshots: 5,
        cluster_reports: 3
      },
      config: {
        embedding_model: "qwen3-embedding:0.6b",
        embedding_api_base: "http://localhost:11434/v1",
        embedding_dimensions: 1024,
        llm_model: "Qwen3.6-35B-A3B-NVFP4",
        llm_api_base: "http://localhost:11434/v1",
        context_window: 262144,
        digest_char_budget: 576716
      }
    };

    mock.onGet("http://localhost:3000/api/v1/status").reply(200, { data: mockStatus });

    const status = await client.getStatus();
    expect(status.status).toBe("ok");
    expect(status.counts.biomes).toBe(8);
    expect(status.counts.species).toBe(120);
    expect(status.counts.organisms).toBe(450);
  });

  it("handles 404 not found errors cleanly", async () => {
    mock.onGet("http://localhost:3000/api/v1/species/999").reply(404, {
      error: { code: "not_found", message: "Couldn't find Species with 'id'=999" }
    });

    await expect(client.getSpecies(999)).rejects.toThrowError(BiologistApiError);
    try {
      await client.getSpecies(999);
    } catch (err: any) {
      expect(err.code).toBe("not_found");
      expect(err.status).toBe(404);
      expect(err.message).toContain("Couldn't find Species");
    }
  });

  it("performs unified semantic search", async () => {
    const mockResults = [
      { type: "Species", score: 0.94, data: { id: 1, name: "Snow Leopard" } }
    ];

    mock
      .onGet("http://localhost:3000/api/v1/search", {
        params: { q: "cold climate alpine apex predator", mode: "semantic", limit: 5 }
      })
      .reply(200, { data: mockResults, meta: { mode: "semantic", count: 1 } });

    const res = await client.search({ q: "cold climate alpine apex predator", mode: "semantic", limit: 5 });
    expect(res.data).toEqual(mockResults);
  });

  it("finds species and organism counterparts via neighbors endpoints", async () => {
    const mockSpecies = [{ id: 2, name: "Clouded Leopard", neighbor_distance: 0.08 }];
    mock
      .onGet("http://localhost:3000/api/v1/species/1/neighbors", {
        params: { limit: 5 }
      })
      .reply(200, { data: mockSpecies });

    const speciesNeighbors = await client.getSpeciesNeighbors(1, { limit: 5 });
    expect(speciesNeighbors).toHaveLength(1);
    expect(speciesNeighbors[0].name).toBe("Clouded Leopard");

    const mockOrganisms = [{ id: 10, name: "Arctic Fox Adult Summer Morph", neighbor_distance: 0.06 }];
    mock
      .onGet("http://localhost:3000/api/v1/organisms/4/neighbors", {
        params: { limit: 5 }
      })
      .reply(200, { data: mockOrganisms });

    const organismNeighbors = await client.getOrganismNeighbors(4, { limit: 5 });
    expect(organismNeighbors).toHaveLength(1);
    expect(organismNeighbors[0].name).toBe("Arctic Fox Adult Summer Morph");
  });

  it("executes biome CRUD methods", async () => {
    const mockBiome = { id: 1, name: "Tropical Rainforest", description: "Equatorial dense canopy", species_count: 24 };

    mock.onPost("http://localhost:3000/api/v1/biomes").reply(201, { data: mockBiome });
    const created = await client.createBiome({ name: "Tropical Rainforest", description: "Equatorial dense canopy" });
    expect(created.name).toBe("Tropical Rainforest");

    mock.onPatch("http://localhost:3000/api/v1/biomes/1").reply(200, { data: { ...mockBiome, name: "Lowland Tropical Rainforest" } });
    const updated = await client.updateBiome(1, { name: "Lowland Tropical Rainforest" });
    expect(updated.name).toBe("Lowland Tropical Rainforest");

    mock.onDelete("http://localhost:3000/api/v1/biomes/1").reply(200, { data: { id: 1, name: "Lowland Tropical Rainforest", deleted: true } });
    const deleted = await client.deleteBiome(1);
    expect(deleted.deleted).toBe(true);
  });

  it("executes clustering, snapshots, and reports", async () => {
    const mockSnapshot = {
      id: 1,
      target_type: "Species",
      level: 5,
      distance_threshold: 0.20,
      title: "Alpine Predator Ecological Clusters",
      clusters_count: 8,
      items_count: 45
    };

    mock.onPost("http://localhost:3000/api/v1/clusters/snapshot").reply(201, { data: mockSnapshot });
    const snapshot = await client.createClusterSnapshot({
      target_type: "Species",
      level: 5,
      title: "Alpine Predator Ecological Clusters"
    });
    expect(snapshot.id).toBe(1);
    expect(snapshot.clusters_count).toBe(8);

    const mockReport = {
      id: 10,
      cluster_snapshot_id: 1,
      title: "Comparative Study of Alpine Carnivore Guilds",
      prompt: "Synthesize guilds",
      status: "completed",
      phase: "completed",
      progress_percentage: 100,
      is_detailed: false
    };

    mock.onPost("http://localhost:3000/api/v1/cluster_reports").reply(201, { data: mockReport });
    const report = await client.createClusterReport({
      cluster_snapshot_id: 1,
      prompt: "Synthesize guilds"
    });
    expect(report.id).toBe(10);
    expect(report.status).toBe("completed");
  });
});
