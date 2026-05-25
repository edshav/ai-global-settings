# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo is a **build/aggregator for AI-assistant configuration**. It composes rules and skills from multiple upstream sources (mostly git submodules) into a single flattened `dist/` tree that is consumed by Claude Code (and other agents) as global/project settings. The build is declarative: `manifest.yaml` is the single source of truth for what gets shipped.

## Commands

```bash
# Build the dist/ tree from manifest.yaml + sources/
npm run build           # equivalent to: npx -y tsx scripts/build.ts

# Initialize / update submodules
git submodule update --init --recursive   # first clone
git submodule update --remote             # pull latest from each submodule

# Add a new external source
git submodule add <repo-url> sources/<name>
```

There is no test suite and no lint config — `npm test` is a placeholder.

## Architecture

Three moving pieces, in build order:

1. **`manifest.yaml`** — top-level keys are *categories* (`rules`, `skills`, …); each value is a list of `{ name, source, enabled }`. `source` is a repo-relative path that may point to either a single `.md` file or a directory containing `SKILL.md` / `README.md`. Setting `enabled: false` excludes an entry from the build without deleting it.

2. **`sources/`** — input material. All subdirectories are git submodules (`anthropic-skills`, `obra-superpowers`, `context7`, `parcadei-Continuous-Claude-v3`, `edshav-skills`). `sources/edshav-skills/` is the maintainer's own skills repo (`edshav/skills`). Never copy upstream content into `sources/` by hand — always add it via `git submodule add` so it stays pinned and updatable.

3. **`scripts/build.ts`** — the only script. Pipeline:
   - `loadSources`: parse YAML, validate with Zod (`ManifestSchema = Record<string, ManifestItem[]>`), drop `enabled: false`.
   - `normalize`: resolve absolute source paths, compute destination as `dist/<category>/<basename(source)>`, extract frontmatter from `.md` / `SKILL.md` / `README.md`.
   - `resolveConflicts`: pre-flight check — abort if two manifest entries map to the same destination path.
   - `emitDist`: only after validation, wipe `dist/` and recursively copy each source to its destination via `fs.cpSync`.

The basename-based destination naming means **renaming a source directory or file changes its output path** — update the manifest entry's `name` to match if you want them in sync.

## Conventions

- `dist/` is gitignored; it's a build artifact, not source.
- Categories in `manifest.yaml` map 1:1 to subdirectories under `dist/` (e.g. `rules:` → `dist/rules/`). Adding a new category requires nothing in the build script — just add the key.
- The build is the only way content reaches `dist/`. Don't hand-edit files there.
- The TypeScript build script targets `tsx` (zero-config ESM runner); `tsconfig.json` exists but the script is run directly, not compiled.
