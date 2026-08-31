# AI crawler access implementation checklist

Use this checklist when changing a public site's crawler policy. It separates documented access controls from evidence of actual crawling or search inclusion.

Last source review: **2026-08-31**

## 1. Define the intended policy

- [ ] Decide separately whether the site should allow search-discovery crawling, potential model-training collection, and user-triggered retrieval.
- [ ] Record who approved the policy and when it should be reviewed again.
- [ ] Identify legal, privacy, licensing, contractual, or customer-content constraints that a technical rule cannot decide for you.

## 2. Inventory the existing controls

- [ ] Save the current public `robots.txt` response before changing it.
- [ ] Preserve rules for ordinary search, security scanners, feeds, sitemaps, and unrelated agents.
- [ ] Check for CDN, WAF, bot-management, authentication, or rate-limit rules that may override `robots.txt` in practice.
- [ ] Confirm whether the site emits `X-Robots-Tag` headers or page-level robots directives that affect indexing separately.

## 3. Map agents to purposes

- [ ] Use `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, and `Googlebot` for the documented search-discovery policy relevant to those providers.
- [ ] Treat `GPTBot`, `ClaudeBot`, and `Google-Extended` as separate model-development or training/grounding controls.
- [ ] Review provider documentation before applying rules to user-triggered agents such as `ChatGPT-User`, `Claude-User`, or `Perplexity-User`; their behavior may differ from automatic crawlers.
- [ ] Do not infer that allowing one agent allows another.

## 4. Prepare the smallest safe change

- [ ] Generate a starting policy with the [browser-only reference](https://alternatefutures.github.io/ai-crawler-access-reference/) or the repository CLI.
- [ ] Merge the generated blocks into the existing file instead of replacing unrelated rules.
- [ ] Keep agent names exact and use the longest applicable path rule for the behavior you intend.
- [ ] Include the public sitemap only when it is accurate and intended for discovery.
- [ ] Have a second person review the diff for accidental broad blocks such as `User-agent: *` plus `Disallow: /`.

## 5. Validate before and after publishing

- [ ] Test the proposed file in a non-production environment where practical.
- [ ] Fetch the exact public HTTPS `robots.txt` response after deployment; do not rely only on the CMS editor.
- [ ] Confirm the response is not an HTML error page, redirect loop, stale cache, or access-denied page.
- [ ] Check each intended agent against the final rules and record the test timestamp.
- [ ] Roll back if ordinary search or another required crawler was unintentionally blocked.

## 6. Measure the right evidence

- [ ] Use origin or CDN logs to look for verified crawler requests where available.
- [ ] Use provider webmaster tools or indexing reports when the provider offers them.
- [ ] Track crawl evidence separately from indexing, ranking, referral traffic, mentions, and citations.
- [ ] Never report an allowed `robots.txt` result as proof of crawling, indexing, ranking, recommendations, mentions, or citations.

## 7. Maintain the policy

- [ ] Recheck provider documentation on a dated schedule and after announced crawler changes.
- [ ] Keep a change log containing the prior policy, new policy, approver, date, and reason.
- [ ] Revalidate after CDN, WAF, CMS, domain, or hosting changes.
- [ ] Open a correction issue when this repository's source matrix no longer matches a provider's current primary documentation.

## Primary documentation

- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)
- [Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Google common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)
- [Google crawling and indexing documentation](https://developers.google.com/search/docs/crawling-indexing)

For a bounded public-rule check, use [AnswerReady's free AI crawler checker](https://answerready.alternatefutures.ai/ai-crawler-checker?utm_source=github&utm_medium=checklist&utm_campaign=ai-crawler-reference). It reports selected search-crawler directives without claiming an “AI visibility score.”

Published by [Alternate Futures](https://alternatefutures.ai/). Implementation and recurring hosting through [Alternate Clouds](https://clouds.alternatefutures.ai/) require a separate scope and approval.
