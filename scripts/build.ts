import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';

/**
 * Zod Schemas for validation
 */
const ManifestItemSchema = z.object({
  name: z.string(),
  source: z.string(),
  enabled: z.boolean().default(true),
});

const ManifestSchema = z.record(z.string(), z.array(ManifestItemSchema));

type ManifestItem = z.infer<typeof ManifestItemSchema>;

interface NormalizedItem extends ManifestItem {
  category: string;
  absoluteSource: string;
  absoluteDestination: string;
  frontmatter: Record<string, any> | null;
}

/**
 * Load and flatten the manifest
 */
function loadSources(manifestPath: string): { category: string; item: ManifestItem }[] {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found: ${manifestPath}`);
  }

  const content = fs.readFileSync(manifestPath, 'utf8');
  const rawJson = yaml.load(content);
  
  const validated = ManifestSchema.parse(rawJson);
  
  const flattened: { category: string; item: ManifestItem }[] = [];
  for (const [category, items] of Object.entries(validated)) {
    for (const item of items) {
      if (item.enabled) {
        flattened.push({ category, item });
      }
    }
  }
  
  return flattened;
}

/**
 * Extract YAML frontmatter from a markdown file string
 */
function extractFrontmatter(content: string): Record<string, any> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (match && match[1]) {
    try {
      return yaml.load(match[1]) as Record<string, any>;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Parse frontmatter from the source
 */
function parseFrontmatter(sourcePath: string): Record<string, any> | null {
  if (!fs.existsSync(sourcePath)) {
    return null;
  }

  const stats = fs.statSync(sourcePath);
  let targetFile: string | null = null;

  if (stats.isFile()) {
    if (sourcePath.endsWith('.md')) {
      targetFile = sourcePath;
    }
  } else if (stats.isDirectory()) {
    const p1 = path.join(sourcePath, 'SKILL.md');
    const p2 = path.join(sourcePath, 'README.md');
    if (fs.existsSync(p1)) {
      targetFile = p1;
    } else if (fs.existsSync(p2)) {
      targetFile = p2;
    }
  }

  if (targetFile) {
    const content = fs.readFileSync(targetFile, 'utf8');
    return extractFrontmatter(content);
  }

  return null;
}

/**
 * Normalize paths and prepare for emission
 */
function normalize(
  baseDir: string, 
  distDir: string, 
  items: { category: string; item: ManifestItem }[]
): NormalizedItem[] {
  return items.map(({ category, item }) => {
    const absoluteSource = path.resolve(baseDir, item.source);
    const basename = path.basename(absoluteSource);
    const absoluteDestination = path.resolve(distDir, category, basename);
    const frontmatter = parseFrontmatter(absoluteSource);

    return {
      ...item,
      category,
      absoluteSource,
      absoluteDestination,
      frontmatter,
    };
  });
}

/**
 * Check for destination conflicts
 */
function resolveConflicts(items: NormalizedItem[]) {
  const destMap = new Map<string, string>(); // destPath -> itemName
  
  for (const item of items) {
    const existing = destMap.get(item.absoluteDestination);
    if (existing) {
      throw new Error(
        `Conflict detected: Multiple items map to same destination path: ${item.absoluteDestination}\n` +
        `  - Item 1: ${existing}\n` +
        `  - Item 2: ${item.name}`
      );
    }
    destMap.set(item.absoluteDestination, item.name);
  }
}

/**
 * Emit the final files to dist
 */
function emitDist(distDir: string, items: NormalizedItem[]) {
  // Clean dist directory
  if (fs.existsSync(distDir)) {
    console.log(`Cleaning dist directory: ${distDir}`);
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  for (const item of items) {
    const destParent = path.dirname(item.absoluteDestination);
    if (!fs.existsSync(destParent)) {
      fs.mkdirSync(destParent, { recursive: true });
    }

    console.log(`Copying ${item.name} build asset to ${item.absoluteDestination}`);
    fs.cpSync(item.absoluteSource, item.absoluteDestination, { recursive: true });
  }
}

/**
 * Main entrance
 */
function main() {
  const rootDir = process.cwd();
  const manifestPath = path.join(rootDir, 'manifest.yaml');
  const distDir = path.join(rootDir, 'dist');

  console.log('Starting build...');

  try {
    // 1. Load Sources
    const rawItems = loadSources(manifestPath);
    console.log(`Loaded ${rawItems.length} items from manifest.`);

    // 2 & 3 & 4. Normalize (includes parseFrontmatter and implicit validation via Zod in loadSources)
    const normalizedItems = normalize(rootDir, distDir, rawItems);

    // 5. Resolve Conflicts
    resolveConflicts(normalizedItems);
    console.log('Validation passed. No conflicts detected.');

    // 6. Emit Dist
    emitDist(distDir, normalizedItems);

    console.log('Build completed successfully!');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('Manifest validation failed:');
      console.error(JSON.stringify(error.format(), null, 2));
    } else {
      console.error('Build failed:');
      console.error(error.message);
    }
    process.exit(1);
  }
}

main();
