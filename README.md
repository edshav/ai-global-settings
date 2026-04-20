# ai-global-settings

## Key Features of the Build Script:

1.  **Validation**: Uses `Zod` to validate the `manifest.yaml` structure at the start of the process.
2.  **Frontmatter Parsing**: Automatically detects and extracts YAML frontmatter from:
    - The source file itself (if it's a markdown file).
    - `SKILL.md` or `README.md` within a source directory.
3.  **Conflict Resolution**: Performs a pre-flight check to ensure no two manifest entries map to the same destination path, aborting the build if a collision is found.
4.  **Atomic-like Clean**: The `dist/` directory is only cleared and overwritten after all files have been validated and normalized.
5.  **Recursive Copy**: Uses `node:fs.cpSync` for efficient recursive copying of both files and directories.

### How to Run:

You can run the script using `tsx` (recommended for zero-config ESM support):

```bash
npx -y tsx scripts/build.ts
```
