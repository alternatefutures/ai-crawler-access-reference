import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("machine-readable files agree on the ten documented controls", async () => {
  const json = JSON.parse(await readFile(new URL("data/crawlers.json", root), "utf8"));
  const csv = await readFile(new URL("data/crawlers.csv", root), "utf8");
  const lines = csv.trim().split("\n");
  assert.equal(json.length, 10);
  assert.equal(lines.length, 11);
  assert.equal(new Set(json.map(({ provider, token }) => `${provider}:${token}`)).size, 10);
  for (const { token, source, sourceChecked } of json) {
    assert.match(csv, new RegExp(`(^|,)${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")},`, "m"));
    assert.match(source, /^https:\/\//);
    assert.equal(sourceChecked, "2026-08-29");
  }
});

test("examples separate search discovery from training controls", async () => {
  const policy = await readFile(new URL("examples/allow-search-block-training.txt", root), "utf8");
  for (const token of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Googlebot"]) {
    assert.match(policy, new RegExp(`User-agent: ${token}\\nAllow: /`));
  }
  for (const token of ["GPTBot", "ClaudeBot", "Google-Extended"]) {
    assert.match(policy, new RegExp(`User-agent: ${token}\\nDisallow: /`));
  }
});

test("README states limits and publisher ownership", async () => {
  const readme = await readFile(new URL("README.md", root), "utf8");
  assert.match(readme, /does \*\*not\*\* guarantee crawling, indexing, ranking, recommendations, mentions, or citations/i);
  assert.match(readme, /Published by \[Alternate Futures\]/);
  assert.match(readme, /utm_source=github/);
  assert.match(readme, /\[CC0 1\.0\]\(DATA_LICENSE\.md\)/);
});
