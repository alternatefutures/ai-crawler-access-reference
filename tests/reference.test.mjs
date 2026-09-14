import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const root = new URL("../", import.meta.url);
const execFileAsync = promisify(execFile);

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
  const { generatePolicy } = await import("../bin/generate-robots.mjs");
  const policy = await readFile(new URL("examples/allow-search-block-training.txt", root), "utf8");
  assert.equal(policy, await generatePolicy("search-only"));
  for (const token of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Googlebot"]) {
    assert.match(policy, new RegExp(`User-agent: ${token}\\nAllow: /`));
  }
  for (const token of ["GPTBot", "ClaudeBot", "Google-Extended"]) {
    assert.match(policy, new RegExp(`User-agent: ${token}\\nDisallow: /`));
  }
  for (const token of ["ChatGPT-User", "Claude-User", "Perplexity-User"]) assert.doesNotMatch(policy, new RegExp(token));
});

test("allow-automatic fixture is generated and still omits user-triggered agents", async () => {
  const { generatePolicy } = await import("../bin/generate-robots.mjs");
  const policy = await readFile(new URL("examples/allow-documented-automatic-crawlers.txt", root), "utf8");
  assert.equal(policy, await generatePolicy("allow-automatic"));
  for (const token of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Googlebot", "GPTBot", "ClaudeBot", "Google-Extended"]) {
    assert.match(policy, new RegExp(`User-agent: ${token}\\nAllow: /`));
  }
  for (const token of ["ChatGPT-User", "Claude-User", "Perplexity-User"]) assert.doesNotMatch(policy, new RegExp(token));
  await assert.rejects(generatePolicy("invented-policy"), /Unknown policy/);
});

test("README states limits and publisher ownership", async () => {
  const readme = await readFile(new URL("README.md", root), "utf8");
  assert.match(readme, /does \*\*not\*\* guarantee crawling, indexing, ranking, recommendations, mentions, or citations/i);
  assert.match(readme, /Published by \[Alternate Futures\]/);
  assert.match(readme, /interactive browser reference and policy generator/);
  assert.match(readme, /utm_source=github/);
  assert.match(readme, /\[CC0 1\.0\]\(DATA_LICENSE\.md\)/);
  assert.match(readme, /never edits a site or local file/i);
  assert.match(readme, /intentionally omit `ChatGPT-User`, `Claude-User`, and `Perplexity-User`/);
});

test("npm package metadata is complete, private, and narrowly scoped", async () => {
  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.equal(packageJson.name, "ai-crawler-access-reference");
  assert.equal(packageJson.version, "1.4.1");
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.license, "MIT");
  assert.equal(packageJson.author.name, "Alternate Futures");
  assert.equal(packageJson.homepage, "https://alternatefutures.github.io/ai-crawler-access-reference/");
  assert.equal(packageJson.repository.url, "git+https://github.com/alternatefutures/ai-crawler-access-reference.git");
  assert.equal(packageJson.bugs.url, "https://github.com/alternatefutures/ai-crawler-access-reference/issues");
  assert.equal(packageJson.bin["ai-crawler-robots"], "./bin/generate-robots.mjs");
  assert.deepEqual(packageJson.files, [
    "bin/generate-robots.mjs",
    "data/crawlers.csv",
    "data/crawlers.json",
    "examples/allow-documented-automatic-crawlers.txt",
    "examples/allow-search-block-training.txt",
    "DATA_LICENSE.md",
    "IMPLEMENTATION_CHECKLIST.md",
  ]);
});

test("npm executable runs through a package-manager-style symlink", async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "ai-crawler-cli-"));
  try {
    const executable = fileURLToPath(new URL("bin/generate-robots.mjs", root));
    const executableLink = join(temporaryDirectory, "ai-crawler-robots");
    await symlink(executable, executableLink);
    const [{ stdout, stderr }, expected] = await Promise.all([
      execFileAsync(executableLink, ["--policy", "search-only"]),
      readFile(new URL("examples/allow-search-block-training.txt", root), "utf8"),
    ]);
    assert.equal(stderr, "");
    assert.equal(stdout, expected);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("citation metadata identifies the versioned work as an open dataset", async () => {
  const citation = await readFile(new URL("CITATION.cff", root), "utf8");
  assert.match(citation, /^cff-version: 1\.2\.0$/m);
  assert.match(citation, /^type: dataset$/m);
  assert.match(citation, /^title: "AI Crawler Access Reference"$/m);
  assert.match(citation, /^  - name: "Alternate Futures"$/m);
  assert.match(citation, /^version: "1\.4\.1"$/m);
  assert.match(citation, /^date-released: "2026-09-12"$/m);
  assert.match(citation, /^license: CC0-1\.0$/m);
  assert.match(citation, /^repository-code: "https:\/\/github\.com\/alternatefutures\/ai-crawler-access-reference"$/m);
  assert.match(citation, /^url: "https:\/\/alternatefutures\.github\.io\/ai-crawler-access-reference\/"$/m);
});

test("GitHub Pages reference preserves source, policy, and ownership boundaries", async () => {
  const page = await readFile(new URL("docs/index.html", root), "utf8");
  const robots = await readFile(new URL("docs/robots.txt", root), "utf8");
  const sitemap = await readFile(new URL("docs/sitemap.xml", root), "utf8");
  for (const token of ["OAI-SearchBot", "GPTBot", "ChatGPT-User", "Claude-SearchBot", "ClaudeBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Googlebot", "Google-Extended"]) {
    assert.match(page, new RegExp(token));
  }
  assert.match(page, /does not guarantee crawling, indexing, ranking, recommendations, mentions, or citations/i);
  assert.match(page, /Nothing is uploaded, stored, or written to your site/i);
  assert.match(page, /utm_source=github/);
  assert.match(page, /Published by/);
  assert.match(page, /Alternate Futures/);
  assert.match(page, /Alternate Clouds/);
  assert.match(page, /2026-08-29/);
  assert.match(page, /IMPLEMENTATION_CHECKLIST\.md/);
  assert.match(page, /href="data\/crawlers\.csv"/);
  assert.match(page, /href="data\/crawlers\.json"/);
  assert.match(robots, /Sitemap: https:\/\/alternatefutures\.github\.io\/ai-crawler-access-reference\/sitemap\.xml/);
  assert.match(sitemap, /https:\/\/alternatefutures\.github\.io\/ai-crawler-access-reference\//);
  assert.match(sitemap, /<lastmod>2026-09-12<\/lastmod>/);
});

test("GitHub Pages publishes matching downloads and valid Dataset metadata", async () => {
  const page = await readFile(new URL("docs/index.html", root), "utf8");
  const sourceCsv = await readFile(new URL("data/crawlers.csv", root), "utf8");
  const sourceJson = JSON.parse(await readFile(new URL("data/crawlers.json", root), "utf8"));
  const publishedCsv = await readFile(new URL("docs/data/crawlers.csv", root), "utf8");
  const publishedJson = JSON.parse(await readFile(new URL("docs/data/crawlers.json", root), "utf8"));
  assert.equal(publishedCsv, sourceCsv);
  assert.deepEqual(publishedJson, sourceJson);

  const match = page.match(/<script id="dataset-metadata" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, "Dataset JSON-LD must be present");
  const metadata = JSON.parse(match[1]);
  assert.equal(metadata["@context"], "https://schema.org");
  assert.equal(metadata["@type"], "Dataset");
  assert.equal(metadata.name, "AI Crawler Access Reference");
  assert.ok(metadata.description.length >= 50);
  assert.equal(metadata.dateModified, "2026-09-12");
  assert.equal(metadata.creator.name, "Alternate Futures");
  assert.equal(metadata.license, "https://creativecommons.org/publicdomain/zero/1.0/");
  assert.equal(metadata.isAccessibleForFree, true);
  assert.deepEqual(
    metadata.distribution.map(({ "@type": type, encodingFormat, contentUrl }) => ({ type, encodingFormat, contentUrl })),
    [
      {
        type: "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: "https://alternatefutures.github.io/ai-crawler-access-reference/data/crawlers.csv"
      },
      {
        type: "DataDownload",
        encodingFormat: "application/json",
        contentUrl: "https://alternatefutures.github.io/ai-crawler-access-reference/data/crawlers.json"
      }
    ]
  );
});

test("GitHub Pages carries a path-scoped IndexNow ownership key", async () => {
  const key = "ac342b4488e2383be6f1b04efc7df013";
  const contents = await readFile(new URL(`docs/${key}.txt`, root), "utf8");
  assert.match(key, /^[A-Fa-f0-9-]{8,128}$/);
  assert.equal(contents, `${key}\n`);
});

test("implementation checklist separates policy, deployment validation, and outcome evidence", async () => {
  const checklist = await readFile(new URL("IMPLEMENTATION_CHECKLIST.md", root), "utf8");
  assert.match(checklist, /Define the intended policy/);
  assert.match(checklist, /Inventory the existing controls/);
  assert.match(checklist, /Validate before and after publishing/);
  assert.match(checklist, /Measure the right evidence/);
  assert.match(checklist, /Never report an allowed `robots\.txt` result as proof/i);
  assert.match(checklist, /AnswerReady's free AI crawler checker/);
  assert.match(checklist, /Published by \[Alternate Futures\]/);
  assert.match(checklist, /Alternate Clouds/);
});
