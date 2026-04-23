# AGENTS.md

Guidance for coding agents working in this repo. Humans should read [README.md](README.md) first for project intent.

## What this repo is

A utility repo around Google Fonts that produces:

- Enhanced metadata (PostScript name ↔ variant mappings, browser-style names) → `webfonts.metadata.json`
- Baked SVG previews per font variant
- A public browser/API at `fonts.grida.co` (the `www/` Next.js app)

The `webfonts.json` / `webfonts-vf.json` at the repo root are symlinks into `www/public/` — treat `www/public/` as the canonical location.

## Repo layout

| Path | Stack | Purpose |
| --- | --- | --- |
| `www/` | Next.js 15 (App Router) + React 19 + TS + Tailwind 4 | Public site + JSON/SVG hosting + API routes |
| `metadata/` | Python 3 (Click CLI) | Generates `webfonts.metadata.json` from Google Fonts API + `vendor/google` |
| `tools/` | Python 3 (fontTools, gftools, svgwrite) | One-off scripts: `fonts2svg.py`, `d_psnames.py`, validators, stats |
| `sdks/google-fonts-js/` | TypeScript | Prebuilt JSON snapshot + minimal JS consumer |
| `sdks/webfonts-rs/` | Rust (edition 2024) | Stub crate, not published |
| `vendor/google` | git submodule | Upstream `google/fonts` — source for TTFs/metadata |
| `vendor/apple-emoji-linux` | git submodule | Apple emoji PNGs (see license notes in README) |
| `d/unicodes.utf8` | data | Unicode reference blob |
| `justfile` | just | Repo-level chores (emoji copy) |

## Common commands

### www (Next.js app)

Package manager is **pnpm** (`pnpm-lock.yaml`, `packageManager: pnpm@10.15.0`). Do not introduce npm/yarn lockfiles.

```bash
cd www
pnpm install
pnpm dev         # next dev --turbopack
pnpm build       # next build --turbopack
pnpm start
pnpm test        # Jest + ts-jest
pnpm lint        # ESLint flat config (eslint.config.mjs)
pnpm typecheck   # tsc --noEmit
```

API routes live under [www/app/api/](www/app/api/): `search/`, `popular/`, `fonts/[id]/`. The app sets global CORS `*` and long-cache headers for `/svg/*` — check [www/next.config.ts](www/next.config.ts) before touching headers.

### metadata (Python CLI)

```bash
cd metadata
pip install -r ../tools/requirements.txt
python cli.py pre-validate
python cli.py map        # extract PostScript names from vendor/google TTFs
python cli.py polyfill   # fill gaps with browser-style names
python cli.py post-validate
python cli.py test
```

Output lands at `www/public/webfonts.metadata.json`. See [metadata/README.md](metadata/README.md) for details.

### tools (Python scripts)

Run directly with `python tools/<script>.py`. Notables:

- [tools/fonts2svg.py](tools/fonts2svg.py) — renders SVG previews into `www/public/svg/`
- [tools/d_psnames.py](tools/d_psnames.py) — extracts PostScript names via fontTools
- `assert_style.py`, `assert_max_vf_2.py` — metadata assertions

### just

```bash
just www-copy-apple-emoji    # rsync vendor emoji → www/public/apple/emoji/160/
just www-clean-apple-emoji
```

### Submodules

```bash
git submodule update --init --recursive
```

`vendor/apple-emoji-linux` shows as modified in `git status` on a fresh clone — that's normal submodule pointer drift; do not commit it unless intentionally bumping.

## Data flow

1. Google Fonts API → `www/public/webfonts.json` (+ `webfonts-vf.json` for VF capability)
2. `metadata/cli.py map` + `polyfill` → `www/public/webfonts.metadata.json`
3. `tools/fonts2svg.py` → `www/public/svg/*.svg` (baked previews, served with immutable cache)
4. `www/` consumes the above and exposes `/api/search`, `/api/popular`, `/api/fonts/[id]`.

If you edit a generator, update the consumers in `www/` to match and verify the JSON shape — the API routes read these files directly.

## Automated data refresh

The repo auto-refreshes its generated data weekly via [.github/workflows/update-fonts.yml](.github/workflows/update-fonts.yml) (Mondays 06:00 UTC, also runnable via `workflow_dispatch`). It opens a PR on branch `bot/fonts-update`.

**The workflow shells out to [tools/refresh.sh](tools/refresh.sh) — that script is the single source of truth for the pipeline.** Verifying the script locally == verifying CI.

Local usage:

```bash
export GOOGLE_FONTS_API_KEY=...      # Google Fonts Developer API key
just refresh                          # full refresh
just refresh --skip-fetch             # reuse existing webfonts.json
just refresh --skip-svg               # skip SVG regeneration (faster iteration)
```

Pipeline steps (each maps to one block in `refresh.sh`):

1. **Preflight** — assert `vendor/google/{apache,ofl,ufl}` exist and contain ≥1500 `METADATA.pb` files. Exits 10/11 and aborts if upstream restructured. This is the fallback for submodule-layout breakage.
2. **Fetch** — [tools/fetch_webfonts.py](tools/fetch_webfonts.py) writes `www/public/webfonts.json` + `webfonts-vf.json`. Sanity-gates on item count ≥1500.
3. **Metadata** — `metadata/cli.py` steps `pre-validate` → `map` → `polyfill` → `post-validate`. Output goes directly to `www/public/webfonts.metadata.json` (no manual copy step).
4. **SVGs** — [tools/fonts2svg.py](tools/fonts2svg.py) renders missing previews into `www/public/svg/`. Existing SVGs are skipped; `failed_fonts.log` records per-family render failures.
5. **Popular stats** — [tools/google_fonts_metadata_stats.py](tools/google_fonts_metadata_stats.py) refreshes `www/app/api/popular/stats.json`.
6. **Lockfile** — [tools/build_lockfile.py](tools/build_lockfile.py) emits `broken.lock.json` at repo root, consolidating families flagged by pre-validate, missing-from-metadata, and failed SVG renders.

**Failure philosophy**: individual family failures never fail the pipeline — they land in `broken.lock.json` and ship with everything else. Only catastrophic failures (bad API response, missing submodule layout, Python exceptions) abort. On workflow failure, an issue `[bot] fonts refresh failing` is opened/updated on this repo.

**Required secret**: `GOOGLE_FONTS_API_KEY` in repo Settings → Secrets → Actions.

**Reviewing broken.lock.json**: the file is checked in and regenerated each run. A human should periodically skim it — persistent entries likely indicate bugs in our pipeline rather than upstream font issues.

## Conventions

- **TypeScript strict mode** in `www/`; use the `@/*` path alias.
- **Tailwind 4** via `@tailwindcss/postcss` — no separate `tailwind.config` edits needed for theme tokens; use CSS variables.
- **ESLint flat config** only; no Prettier config present — don't add one without asking.
- **Jest** with `ts-jest` for `www/` tests. No test suite for Python tools.
- **Python**: Click for CLIs, fontTools for TTF parsing, tqdm for progress. Requirements pinned in `tools/requirements.txt`.
- Do not hand-edit files under `www/public/svg/` or the generated `webfonts*.json` — regenerate them via `just refresh`.
- Do not hand-edit `broken.lock.json` — it is rebuilt each refresh run.

## Things to not do

- Don't check in AppleColorEmoji.ttf or other proprietary Apple assets — repo deliberately avoids redistributing them (README §Vendors).
- Don't bump the `vendor/apple-emoji-linux` submodule pointer unless the task explicitly calls for it.
- Don't switch `www/` off pnpm or off Turbopack without discussion.
- Don't add features to `sdks/webfonts-rs/` — it's an intentional stub.

## Verifying a change

For `www/` changes: `pnpm typecheck && pnpm lint && pnpm test`, then `pnpm dev` and hit the affected route in a browser.

For metadata/tools changes: run the relevant `metadata/cli.py` subcommand end-to-end against a small subset and diff the resulting JSON before committing the full regeneration.
