# npm release runbook

This runbook publishes the zero-dependency crawler-policy CLI without weakening the repository's evidence, attribution, or credential boundaries.

## Preconditions

- AnswerReady pull request 5 is merged and deployed so `npmjs.com` referrers are accepted as the bounded `npm` acquisition source.
- This repository's release pull request 6 is merged into `main`.
- `main` is clean, its head commit is known, and `package.json` is exactly version `1.4.3`.
- `npm view ai-crawler-access-reference name version --json` still returns `E404`. If it returns a package that is not controlled by Alternate Futures, stop; do not rename or publish opportunistically.
- The publishing account has two-factor authentication enabled. Do not place an npm password, one-time code, session token, or generated access token in the repository, a command argument, a log, or a pull-request comment.

## Authenticate

Use npm's interactive browser flow:

```sh
npm login --auth-type=web
npm whoami
```

Authentication writes to the user's npm configuration outside the repository. Do not copy that credential into a project `.npmrc` file.

## Rebuild the release evidence

From the exact merged `main` commit:

```sh
git status --short
git rev-parse HEAD
npm test
npm pack --dry-run --json
```

The status must be clean. The test suite must pass. The dry run must report `ai-crawler-access-reference@1.4.3` and only these ten paths:

- `DATA_LICENSE.md`
- `IMPLEMENTATION_CHECKLIST.md`
- `LICENSE`
- `README.md`
- `bin/generate-robots.mjs`
- `data/crawlers.csv`
- `data/crawlers.json`
- `examples/allow-documented-automatic-crawlers.txt`
- `examples/allow-search-block-training.txt`
- `package.json`

Stop if any generated credential, local configuration, unrelated file, or unexpected executable appears.

## Publish

Publishing is the irreversible public step and requires action-time approval:

```sh
npm publish --access public
```

Complete npm's interactive second-factor challenge. Do not bypass two-factor authentication or create a long-lived automation token for this first release.

## Verify before announcing

```sh
npm view ai-crawler-access-reference@1.4.3 name version description dist-tags repository --json
npm exec --yes --package=ai-crawler-access-reference@1.4.3 ai-crawler-robots -- --policy search-only
npm exec --yes --package=ai-crawler-access-reference@1.4.3 ai-crawler-robots -- --policy allow-automatic
```

Compare both command outputs with the reviewed files under `examples/`. Verify that the public npm page shows Alternate Futures ownership links, the canonical AnswerReady links, the MIT code license, and the CC0 dataset license. Only after those checks pass should a signed `v1.4.3` Git tag and matching GitHub release be created from the exact published commit.

## Measurement and rollback

- Treat npm downloads as distribution activity, not qualified demand or revenue. Package-manager caches, CI jobs, mirrors, and repeat installs can inflate them.
- Count an npm referral only when AnswerReady records the bounded `npm` source and it is not known operator activity.
- Count revenue only through the existing authoritative Stripe or Relay order verification.
- If the wrong files or unsafe behavior are published, stop promotion immediately. npm documents a limited unpublish path for a new package within 72 hours when no other public package depends on it, but unpublishing is destructive, cannot restore the same package version, and requires separate approval. Prefer a corrective version or deprecation when removal is not necessary.

## Official npm references

- Publishing and public access: https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/
- Web authentication and 2FA: https://docs.npmjs.com/accessing-npm-using-2fa/
- Publishing authentication requirements: https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/
- Unpublish policy: https://docs.npmjs.com/policies/unpublish/
