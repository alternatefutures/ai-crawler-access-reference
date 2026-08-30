#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const dataUrl = new URL("../data/crawlers.json", import.meta.url);
const policies = new Set(["search-only", "allow-automatic"]);

export async function generatePolicy(policy) {
  if (!policies.has(policy)) throw new Error(`Unknown policy: ${policy}`);

  const crawlers = JSON.parse(await readFile(dataUrl, "utf8"));
  const reviewed = [...new Set(crawlers.map((entry) => entry.sourceChecked))].sort().at(-1);
  const search = crawlers.filter((entry) => entry.category === "search-discovery" && entry.automaticCrawler);
  const developmentControls = crawlers.filter((entry) => ["model-training", "training-and-grounding-control"].includes(entry.category));

  const lines = [
    `# AI crawler policy generated from sources reviewed ${reviewed}`,
    "# User-triggered agents are intentionally omitted because provider behavior differs.",
    "",
    "# Automatic search discovery",
  ];

  for (const entry of search) lines.push(`User-agent: ${entry.token}`, "Allow: /", "");

  lines.push(policy === "search-only" ? "# Model-development and grounding controls: blocked" : "# Model-development and grounding controls: allowed");
  const directive = policy === "search-only" ? "Disallow: /" : "Allow: /";
  for (const entry of developmentControls) lines.push(`User-agent: ${entry.token}`, directive, "");

  return `${lines.join("\n").trimEnd()}\n`;
}

function usage() {
  return [
    "Usage: ai-crawler-robots --policy <search-only|allow-automatic>",
    "",
    "Prints a policy to stdout. It never edits robots.txt.",
  ].join("\n");
}

async function main(args) {
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const flag = args.indexOf("--policy");
  const policy = flag >= 0 ? args[flag + 1] : undefined;
  if (!policy) throw new Error(`${usage()}\n\nMissing --policy.`);
  process.stdout.write(await generatePolicy(policy));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
