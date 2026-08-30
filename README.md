# AI crawler access reference and robots.txt generator

A source-linked reference and zero-dependency policy generator for the robots.txt controls documented by OpenAI, Anthropic, Perplexity, and Google.

The important distinction is purpose: search discovery, model-training collection, and user-triggered retrieval are separate controls. Allowing one does not automatically allow another. A crawler being allowed also does **not** guarantee crawling, indexing, ranking, recommendations, mentions, or citations.

Last source review: **2026-08-29**

## Quick reference

| Provider | Token | Primary purpose | robots.txt note |
|---|---|---|---|
| OpenAI | `OAI-SearchBot` | ChatGPT search discovery | Automatic crawler; managed separately from GPTBot |
| OpenAI | `GPTBot` | Potential foundation-model training collection | A disallow signals that site content should not be used for training |
| OpenAI | `ChatGPT-User` | User-triggered retrieval | Not an automatic web crawler; robots.txt rules may not apply |
| Anthropic | `Claude-SearchBot` | Claude search discovery | Anthropic says disabling it may reduce search visibility and accuracy |
| Anthropic | `ClaudeBot` | Potential model-training collection | Separate from Claude search and user retrieval |
| Anthropic | `Claude-User` | User-triggered retrieval | Anthropic documents this as a distinct robots.txt control |
| Perplexity | `PerplexityBot` | Perplexity search discovery | Automatic crawler with published IP ranges |
| Perplexity | `Perplexity-User` | User-triggered retrieval | Perplexity says it generally ignores robots.txt because the fetch is user-requested |
| Google | `Googlebot` | Google Search crawling | Affects Google Search and related search products |
| Google | `Google-Extended` | Gemini training and grounding control | Control token only; it is not a separate HTTP user agent and does not affect Google Search inclusion or ranking |

Machine-readable versions are in [`data/crawlers.csv`](data/crawlers.csv) and [`data/crawlers.json`](data/crawlers.json).

## Example: allow search, block training collection

This example keeps documented search-discovery crawlers open while opting out of the provider-specific training controls. It is a starting point, not legal or policy advice.

```robots.txt
User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: ClaudeBot
Disallow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Disallow: /
```

Copyable files are in [`examples/`](examples/). Preserve unrelated rules in an existing robots.txt file and test the public response after any change.

## Generate a policy locally

The zero-dependency CLI prints to standard output and never edits a site or local file:

```sh
npm run generate -- --policy search-only
```

Use `--policy allow-automatic` to allow the documented automatic search and model-development controls. Both policies intentionally omit `ChatGPT-User`, `Claude-User`, and `Perplexity-User` because user-triggered retrieval and robots.txt behavior differ by provider.

Review the generated text, merge it with existing rules, and test the public response before deployment. The checked-in files under [`examples/`](examples/) are generated-policy fixtures.

## Primary sources

- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)
- [Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Google common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)
- [Google crawling and indexing documentation](https://developers.google.com/search/docs/crawling-indexing)

## Verify a site

[AnswerReady's free AI crawler checker](https://answerready.alternatefutures.ai/ai-crawler-checker?utm_source=github&utm_medium=resource-repository&utm_campaign=ai-crawler-reference) evaluates the public robots.txt rules for selected search crawlers. It does not call crawler access an AI-visibility score or promise a citation.

Published by [Alternate Futures](https://alternatefutures.ai/). Optional implementation and hosting are separately scoped through [Alternate Clouds](https://clouds.alternatefutures.ai/).

## Corrections and contributions

Provider documentation changes. Open an issue with the provider's current primary-source URL, the exact field that needs correction, and the date checked. See [CONTRIBUTING.md](CONTRIBUTING.md).

Code and examples are [MIT licensed](LICENSE). The factual dataset is dedicated under [CC0 1.0](DATA_LICENSE.md).
