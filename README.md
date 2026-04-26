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

Here’s a clean section you can drop into your README:

---

## Adding External Skill Repositories

This project uses **Git submodules** to include external skill repositories inside the `sources/` directory. This allows you to reuse and update skills without duplicating them.

### 1. Add a New Repository

Run the following command from the root of the project:

```bash
git submodule add <repository-url> sources/<name>
```

**Example:**

```bash
git submodule add git@github.com:upstash/context7.git sources/context7
```

This will:

- Clone the repository into `sources/<name>`
- Register it in `.gitmodules`
- Track it as a submodule (not a regular folder)

---

### 2. Commit the Changes

```bash
git add .gitmodules sources/<name>
git commit -m "Add <name> as a submodule"
```

---

### 3. Initialize Submodules (for new clones)

When cloning this repo on a new machine:

```bash
git clone <your-repo>
cd <your-repo>
git submodule update --init --recursive
```

---

### 4. Updating External Repositories

To fetch the latest changes from all submodules:

```bash
git submodule update --remote
```

Then commit the updated references:

```bash
git add sources
git commit -m "Update submodules"
```

---

### 5. Removing a Submodule (if needed)

```bash
git submodule deinit -f sources/<name>
git rm sources/<name>
rm -rf .git/modules/sources/<name>
```

Then commit:

```bash
git commit -m "Remove <name> submodule"
```

---

### Important Notes

- Do **not** manually copy repositories into `sources/` — always use `git submodule add`.
- Avoid running `git add sources` blindly if you encounter warnings; ensure submodules are properly registered.
- Each submodule is pinned to a specific commit, ensuring reproducible builds.
