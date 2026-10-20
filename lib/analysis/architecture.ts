import type {
  ArchitectureCategory,
  ArchitectureEdge,
  ArchitectureNode,
  RepositoryArchitecture,
} from "@/types/analysis";

type GithubTreeEntry = {
  path: string;
  type: string;
  sha: string;
  size?: number;
};

type GithubTreeResponse = {
  tree?: GithubTreeEntry[];
  truncated?: boolean;
};

type GithubBlobResponse = {
  content?: string;
  encoding?: string;
};

type SourceFile = {
  path: string;
  content: string;
};

const sourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py"];
const ignoredPathParts = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "generated",
  "node_modules",
  "out",
  "vendor",
]);
const categoryOrder: ArchitectureCategory[] = [
  "repository",
  "configuration",
  "route",
  "page",
  "component",
  "authentication",
  "service",
  "model",
  "module",
  "external",
  "test",
];
const categoryColors: Record<ArchitectureCategory, string> = {
  repository: "#58a6ff",
  route: "#3fb950",
  page: "#a371f7",
  component: "#58a6ff",
  service: "#f2cc60",
  model: "#db6d28",
  authentication: "#f778ba",
  external: "#79c0ff",
  configuration: "#8b949e",
  test: "#7ee787",
  module: "#c9d1d9",
};

function isIgnoredPath(path: string) {
  return path.split("/").some((part) =>
    ignoredPathParts.has(part) || part.includes(".generated."),
  ) || /\.(?:lock|min)\./i.test(path) || /\.(?:map|snap)$/i.test(path);
}

function isAnalyzablePath(path: string) {
  const normalized = path.toLowerCase();
  return sourceExtensions.some((extension) => normalized.endsWith(extension))
    || /(?:^|\/)(?:package\.json|tsconfig(?:\.[^/]+)?\.json|next\.config\.[^/]+|vite\.config\.[^/]+|webpack\.config\.[^/]+|middleware\.[^/]+|drizzle\.config\.[^/]+|prisma\.config\.[^/]+)$/i.test(normalized)
    || /(?:^|\/)(?:schema\.prisma|supabase\/config\.toml)$/i.test(normalized);
}

function candidateScore(path: string) {
  const lowerPath = path.toLowerCase();
  let score = 0;

  if (/(?:^|\/)(?:package\.json|tsconfig(?:\.[^/]+)?\.json|next\.config\.[^/]+|middleware\.[^/]+)$/.test(lowerPath)) score += 100;
  if (/(?:^|\/)(?:app|src\/app|pages|src\/pages)\/.*(?:page|layout|route|middleware)\.[^.]+$/.test(lowerPath)) score += 80;
  if (/(?:^|\/)(?:services?|controllers?|routes?|models?|components?|lib|utils?)\//.test(lowerPath)) score += 40;
  if (/(?:auth|payment|stripe|supabase|prisma|database|db)/.test(lowerPath)) score += 15;
  if (/\.(?:tsx|jsx)$/.test(lowerPath)) score += 8;
  if (/(?:^|\/)(__tests__|tests?|spec)\//.test(lowerPath) || /\.(?:test|spec)\.[^.]+$/.test(lowerPath)) score += 5;
  return score;
}

function classify(path: string, content: string): ArchitectureCategory {
  const normalized = path.toLowerCase();
  if (/(?:^|\/)(__tests__|tests?|spec)\//.test(normalized) || /\.(?:test|spec)\.[^.]+$/.test(normalized)) return "test";
  if (/(?:^|\/)(?:app\/api|src\/app\/api|pages\/api|src\/pages\/api|routes?)\//.test(normalized) || /(?:^|\/)route\.[^.]+$/.test(normalized)) return "route";
  if (/(?:^|\/)(?:app|src\/app|pages|src\/pages)\//.test(normalized) && /(?:page|layout)\.[^.]+$/.test(normalized)) return "page";
  if (/(?:^|\/)components?\//.test(normalized)) return "component";
  if (/(?:^|\/)(?:auth|authentication|login|session)(?:\/|[.-])/.test(normalized)) return "authentication";
  if (/(?:services?|controllers?|business|use-cases?)\//.test(normalized)) return "service";
  if (/(?:models?|schema|entities|prisma)\//.test(normalized) || /schema\.prisma$/.test(normalized)) return "model";
  if (/(?:^|\/)(?:package\.json|tsconfig[^/]*\.json|next\.config\.[^/]+|vite\.config\.[^/]+|webpack\.config\.[^/]+|middleware\.[^/]+|.*\.config\.[^/]+)$/.test(normalized)) return "configuration";
  if (content && /(?:createClient|new (?:Stripe|PrismaClient)|supabase|stripe|firebase|axios\.create)/i.test(content)) return "service";
  return "module";
}

function extractImports(path: string, content: string) {
  const imports = new Set<string>();
  const extension = path.slice(path.lastIndexOf(".")).toLowerCase();
  const pattern = extension === ".py"
    ? /^\s*(?:from\s+([.\w]+)\s+import|import\s+([.\w]+))/gm
    : /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)|import\(\s*["']([^"']+)["']\s*\)/g;

  for (const match of content.matchAll(pattern)) {
    const specifier = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (specifier) imports.add(specifier);
  }

  return [...imports];
}

function normalizePath(path: string) {
  const parts: string[] = [];
  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
}

function resolveInternalImport(
  sourcePath: string,
  specifier: string,
  filePaths: Set<string>,
  aliases: Array<{ prefix: string; targets: string[] }>,
) {
  const candidates: string[] = [];
  const isPython = sourcePath.toLowerCase().endsWith(".py");

  if (isPython) {
    const relativePrefix = specifier.match(/^\.+/)?.[0];
    if (relativePrefix) {
      const directory = sourcePath.slice(0, sourcePath.lastIndexOf("/")).split("/").filter(Boolean);
      for (let index = 1; index < relativePrefix.length; index += 1) directory.pop();
      const modulePath = specifier.slice(relativePrefix.length).replace(/\./g, "/");
      candidates.push(normalizePath(`${directory.join("/")}/${modulePath}`));
    } else {
      const modulePath = normalizePath(specifier.replace(/\./g, "/"));
      candidates.push(modulePath, normalizePath(`src/${modulePath}`));
    }
  } else if (specifier.startsWith(".")) {
    candidates.push(normalizePath(`${sourcePath.slice(0, sourcePath.lastIndexOf("/") + 1)}${specifier}`));
  } else {
    for (const alias of aliases) {
      if (!specifier.startsWith(alias.prefix)) continue;
      const suffix = specifier.slice(alias.prefix.length);
      candidates.push(...alias.targets.map((target) => normalizePath(`${target}/${suffix}`)));
    }
    if (candidates.length === 0 && (specifier.startsWith("@/") || specifier.startsWith("~/"))) {
      candidates.push(normalizePath(`src/${specifier.slice(2)}`), normalizePath(specifier.slice(2)));
    }
  }

  for (const candidate of candidates) {
    const resolved = [
      candidate,
      ...sourceExtensions.map((extension) => `${candidate}${extension}`),
      ...sourceExtensions.map((extension) => `${candidate}/index${extension}`),
      ...sourceExtensions.map((extension) => `${candidate}/__init__${extension}`),
    ]
      .find((possible) => filePaths.has(possible));
    if (resolved) return resolved;
  }
  return null;
}

function readAliases(config: SourceFile | undefined) {
  if (!config) return [];
  try {
    const json = JSON.parse(config.content.replace(/^\s*\/\/.*$/gm, ""));
    const paths = json.compilerOptions?.paths;
    if (!paths || typeof paths !== "object") return [];
    const baseUrl = typeof json.compilerOptions.baseUrl === "string" ? json.compilerOptions.baseUrl : "";
    const configDirectory = config.path.includes("/") ? config.path.slice(0, config.path.lastIndexOf("/")) : "";
    return Object.entries(paths).flatMap(([pattern, values]) => {
      if (!Array.isArray(values)) return [];
      const wildcardIndex = pattern.indexOf("*");
      const prefix = wildcardIndex >= 0 ? pattern.slice(0, wildcardIndex) : pattern;
      const targets = values.filter((value): value is string => typeof value === "string").map((value) => {
        const target = value.replace(/\*.*$/, "");
        return normalizePath(`${configDirectory}/${baseUrl}/${target}`);
      });
      return [{ prefix, targets }];
    });
  } catch {
    return [];
  }
}

function findCircularDependencies(edges: ArchitectureEdge[]) {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]);

  let index = 0;
  let cycles = 0;
  const indices = new Map<string, number>();
  const lowLinks = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();

  function visit(node: string) {
    indices.set(node, index);
    lowLinks.set(node, index);
    index += 1;
    stack.push(node);
    onStack.add(node);

    for (const neighbor of adjacency.get(node) ?? []) {
      if (!indices.has(neighbor)) {
        visit(neighbor);
        lowLinks.set(node, Math.min(lowLinks.get(node)!, lowLinks.get(neighbor)!));
      } else if (onStack.has(neighbor)) {
        lowLinks.set(node, Math.min(lowLinks.get(node)!, indices.get(neighbor)!));
      }
    }

    if (lowLinks.get(node) !== indices.get(node)) return;
    let componentSize = 0;
    let member = "";
    do {
      member = stack.pop()!;
      onStack.delete(member);
      componentSize += 1;
    } while (member !== node);
    if (componentSize > 1 || (adjacency.get(node) ?? []).includes(node)) cycles += 1;
  }

  for (const node of adjacency.keys()) {
    if (!indices.has(node)) visit(node);
  }
  return cycles;
}

async function fetchJson<T>(url: string, headers: HeadersInit): Promise<T> {
  const response = await fetch(url, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
      throw new Error("GitHub API rate limit reached while analyzing repository architecture. Try again later or connect an account with a GitHub token.");
    }
    if (response.status === 404) {
      throw new Error("GitHub could not access the repository source tree. Check that the repository is public or reconnect an account with access.");
    }
    throw new Error(`GitHub returned ${response.status} for repository architecture data.`);
  }
  return response.json() as Promise<T>;
}

async function mapWithConcurrency<T, R>(
  values: T[],
  limit: number,
  callback: (value: T) => Promise<R>,
) {
  const results: R[] = new Array(values.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await callback(values[currentIndex]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function buildRepositoryArchitecture({
  owner,
  repo,
  branch,
  headers,
}: {
  owner: string;
  repo: string;
  branch: string;
  headers: HeadersInit;
}): Promise<RepositoryArchitecture> {
  const encodedBranch = encodeURIComponent(branch);
  const treeResponse = await fetchJson<GithubTreeResponse>(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodedBranch}?recursive=1`,
    headers,
  );
  const tree = (treeResponse.tree ?? []).filter((entry) =>
    entry.type === "blob" && !isIgnoredPath(entry.path) && isAnalyzablePath(entry.path),
  );
  const totalFiles = treeResponse.tree?.filter((entry) => entry.type === "blob").length ?? 0;
  const candidates = [...tree]
    .filter((entry) => (entry.size ?? 0) <= 64 * 1024)
    .sort((first, second) => candidateScore(second.path) - candidateScore(first.path))
    .slice(0, 32);
  let sourceReadFailures = 0;

  const fetched = await mapWithConcurrency(candidates, 8, async (entry) => {
    try {
      const blob = await fetchJson<GithubBlobResponse>(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs/${entry.sha}`,
        headers,
      );
      if (blob.encoding !== "base64" || typeof blob.content !== "string") return null;
      const content = Buffer.from(blob.content.replace(/\s/g, ""), "base64").toString("utf8");
      if (content.includes("\u0000")) return null;
      return { path: entry.path, content: content.slice(0, 64 * 1024) } satisfies SourceFile;
    } catch {
      sourceReadFailures += 1;
      return null;
    }
  });
  const sourceFiles = fetched.filter((file): file is SourceFile => file !== null);
  const sourceFilesByPath = new Map(sourceFiles.map((file) => [file.path, file]));
  const packageJson = sourceFilesByPath.get("package.json") ?? sourceFiles.find((file) => /(?:^|\/)package\.json$/i.test(file.path));
  let dependencies: Record<string, string> = {};
  let frameworks: string[] = [];
  if (packageJson) {
    try {
      const manifest = JSON.parse(packageJson.content);
      dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
      frameworks = [
        ["Next.js", "next"],
        ["React", "react"],
        ["Vue", "vue"],
        ["Svelte", "svelte"],
        ["Express", "express"],
        ["Fastify", "fastify"],
        ["NestJS", "@nestjs/core"],
        ["Vite", "vite"],
      ].flatMap(([label, packageName]) => Object.hasOwn(dependencies, packageName) ? [label] : []);
    } catch {
      sourceReadFailures += 1;
    }
  }

  const tsConfig = sourceFiles.find((file) => /(?:^|\/)tsconfig(?:\.[^/]+)?\.json$/i.test(file.path));
  const aliases = readAliases(tsConfig);
  const filePaths = new Set(sourceFiles.map((file) => file.path));
  const nodes: ArchitectureNode[] = [{
    id: "repository",
    label: `${owner}/${repo}`,
    filePath: `${owner}/${repo}`,
    category: "repository",
    metadata: { imports: [], importedBy: [], dependencyCount: 0 },
  }];
  const edges: ArchitectureEdge[] = [];
  const nodeByPath = new Map<string, ArchitectureNode>();

  for (const file of sourceFiles) {
    const node: ArchitectureNode = {
      id: file.path,
      label: file.path.split("/").at(-1) ?? file.path,
      filePath: file.path,
      category: classify(file.path, file.content),
      metadata: { imports: [], importedBy: [], dependencyCount: 0 },
    };
    nodes.push(node);
    nodeByPath.set(file.path, node);
  }

  const externalPackages = new Set<string>();
  for (const file of sourceFiles) {
    const sourceNode = nodeByPath.get(file.path)!;
    for (const specifier of extractImports(file.path, file.content)) {
      const internalPath = resolveInternalImport(file.path, specifier, filePaths, aliases);
      if (internalPath) {
        const target = nodeByPath.get(internalPath)!;
        sourceNode.metadata!.imports!.push(internalPath);
        target.metadata!.importedBy!.push(file.path);
        edges.push({
          id: `${file.path}->${internalPath}`,
          source: file.path,
          target: internalPath,
          relationship: "imports",
          confidence: "high",
        });
        continue;
      }

      if (specifier.startsWith(".") || specifier.startsWith("/") || specifier.startsWith("#")) continue;
      const packageName = specifier.startsWith("@")
        ? specifier.split("/").slice(0, 2).join("/")
        : specifier.split("/")[0];
      if (Object.hasOwn(dependencies, packageName)) externalPackages.add(packageName);
    }
  }

  for (const packageName of [...externalPackages].sort()) {
    const id = `external:${packageName}`;
    const externalNode: ArchitectureNode = {
      id,
      label: packageName,
      filePath: "package.json",
      category: "external",
      metadata: { imports: [], importedBy: [], dependencyCount: 0 },
    };
    nodes.push(externalNode);
    for (const file of sourceFiles) {
      const node = nodeByPath.get(file.path)!;
      const importsPackage = extractImports(file.path, file.content).some((specifier) => {
        const importedPackage = specifier.startsWith("@")
          ? specifier.split("/").slice(0, 2).join("/")
          : specifier.split("/")[0];
        return importedPackage === packageName;
      });
      if (!importsPackage) continue;
      node.metadata!.imports!.push(id);
      externalNode.metadata!.importedBy!.push(file.path);
      edges.push({
        id: `${file.path}->${id}`,
        source: file.path,
        target: id,
        relationship: "imports",
        confidence: "high",
      });
    }
  }

  for (const node of nodes) node.metadata!.dependencyCount = node.metadata!.imports!.length;
  const languages = [...new Set(sourceFiles.flatMap((file): string[] => {
    const extension = file.path.slice(file.path.lastIndexOf(".")).toLowerCase();
    if (extension === ".py") return ["Python"];
    if ([".ts", ".tsx"].includes(extension)) return ["TypeScript"];
    if ([".js", ".jsx", ".mjs", ".cjs"].includes(extension)) return ["JavaScript"];
    return [];
  }))].sort();
  const warnings: string[] = [];
  if (treeResponse.truncated) warnings.push("GitHub truncated the repository tree; graph coverage may be incomplete.");
  if (sourceReadFailures > 0) warnings.push(`${sourceReadFailures} source files could not be read or parsed.`);
  if (tree.length > candidates.length) warnings.push(`Analyzed ${sourceFiles.length} of ${tree.length} eligible files to stay within GitHub API limits.`);
  if (sourceFiles.length === 0) warnings.push("No supported source or configuration files could be read.");

  return {
    repository: `${owner}/${repo}`,
    languages,
    frameworks,
    warnings,
    nodes,
    edges,
    metrics: {
      totalFiles,
      analyzedFiles: sourceFiles.length,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      circularDependencies: findCircularDependencies(edges.filter((edge) => nodeByPath.has(edge.source) && nodeByPath.has(edge.target))),
    },
    categoryColors,
    categoryOrder,
  };
}
