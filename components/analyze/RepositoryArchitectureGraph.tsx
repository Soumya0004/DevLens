"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Boxes,
  Braces,
  Cable,
  ChevronDown,
  CircleAlert,
  Database,
  FileCode2,
  GitBranch,
  Globe2,
  Layers3,
  LockKeyhole,
  Package,
  Search,
  Server,
} from "lucide-react";
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type {
  ArchitectureCategory,
  ArchitectureNode,
  RepositoryArchitecture,
} from "@/types/analysis";

type FlowNodeData = {
  architecture: ArchitectureNode;
  accent: string;
  dimmed: boolean;
  isSelected: boolean;
};

type FlowNode = Node<FlowNodeData, "architecture">;

const categoryIcons: Record<ArchitectureCategory, typeof Braces> = {
  repository: Package,
  route: Cable,
  page: Layers3,
  component: Boxes,
  service: Server,
  model: Database,
  authentication: LockKeyhole,
  external: Globe2,
  configuration: Braces,
  test: Activity,
  module: FileCode2,
};

function ArchitectureNodeCard({ data }: NodeProps<FlowNode>) {
  const Icon = categoryIcons[data.architecture.category];

  return (
    <div
      className={`w-[220px] rounded-xl border bg-[#0d1117] px-3 py-3 shadow-lg shadow-black/20 transition-all duration-200 ${data.isSelected ? "border-white ring-2 ring-[#58a6ff]/60" : "border-[#30363d]"} ${data.dimmed ? "opacity-25" : "opacity-100"}`}
      style={{ borderTopColor: data.accent }}
    >
      <Handle type="target" position={Position.Top} className="!border-[#8b949e] !bg-[#161b22]" />
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#161b22]" style={{ color: data.accent }}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 truncate text-sm font-semibold text-[#e6edf3]" title={data.architecture.label}>
          {data.architecture.label}
        </span>
      </div>
      <p className="mt-2 truncate font-mono text-[10px] text-[#8b949e]" title={data.architecture.filePath}>
        {data.architecture.filePath}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ color: data.accent, backgroundColor: `${data.accent}18` }}>
          {data.architecture.category}
        </span>
        <span className="text-[10px] text-[#8b949e]">
          {data.architecture.metadata?.dependencyCount ?? 0} deps
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!border-[#8b949e] !bg-[#161b22]" />
    </div>
  );
}

const nodeTypes: NodeTypes = { architecture: ArchitectureNodeCard };

function createFlowNodes(architecture: RepositoryArchitecture): FlowNode[] {
  const stageForCategory: Record<ArchitectureCategory, number> = {
    repository: 0,
    configuration: 1,
    route: 2,
    page: 2,
    component: 3,
    authentication: 4,
    service: 4,
    module: 4,
    model: 5,
    external: 5,
    test: 6,
  };
  const stages = new Map<number, ArchitectureNode[]>();
  for (const node of architecture.nodes) {
    const stage = stageForCategory[node.category];
    stages.set(stage, [...(stages.get(stage) ?? []), node]);
  }

  const positions = new Map<string, { x: number; y: number }>();
  let stageTop = 70;
  for (const [, stageNodes] of [...stages.entries()].sort(([first], [second]) => first - second)) {
    const ordered = stageNodes.sort((first, second) => first.filePath.localeCompare(second.filePath));
    ordered.forEach((node, index) => {
      positions.set(node.id, {
        x: 70 + (index % 4) * 255,
        y: stageTop + Math.floor(index / 4) * 145,
      });
    });
    stageTop += Math.max(220, Math.ceil(ordered.length / 4) * 145 + 70);
  }

  return architecture.nodes.map((node) => ({
    id: node.id,
    type: "architecture",
    position: positions.get(node.id)!,
    data: {
      architecture: node,
      accent: architecture.categoryColors[node.category],
      dimmed: false,
      isSelected: false,
    },
  }));
}

function findRelatedNodeIds(selectedId: string, edges: RepositoryArchitecture["edges"]) {
  const related = new Set([selectedId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const edge of edges) {
      if (related.has(edge.source) && !related.has(edge.target)) {
        related.add(edge.target);
        changed = true;
      }
      if (related.has(edge.target) && !related.has(edge.source)) {
        related.add(edge.source);
        changed = true;
      }
    }
  }

  return related;
}

function GraphLoadingState() {
  const stages = [
    "Fetching repository tree",
    "Identifying languages and entry points",
    "Analyzing imports and dependencies",
    "Building the architecture graph",
    "Preparing analysis results",
  ];

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-6">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#30363d] border-t-[#58a6ff]" />
        <div>
          <h3 className="font-semibold text-[#e6edf3]">Analyzing repository architecture</h3>
          <p className="mt-1 text-xs text-[#8b949e]">The server is inspecting tracked source files and their declared dependencies.</p>
        </div>
      </div>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stages.map((stage, index) => (
          <li key={stage} className="flex items-start gap-2 text-xs text-[#8b949e]">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[#30363d] text-[10px]">
              {index + 1}
            </span>
            {stage}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ArchitectureGraphCanvas({ architecture }: { architecture: RepositoryArchitecture }) {
  const initialNodes = useMemo(() => createFlowNodes(architecture), [architecture]);
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ArchitectureCategory | "all">("all");

  const nodeById = useMemo(() => new Map(architecture.nodes.map((node) => [node.id, node])), [architecture.nodes]);
  const matchingIds = useMemo(() => {
    const query = search.trim().toLowerCase();
    return new Set(architecture.nodes
      .filter((node) => category === "all" || node.category === category)
      .filter((node) => !query || `${node.label} ${node.filePath}`.toLowerCase().includes(query))
      .map((node) => node.id));
  }, [architecture.nodes, category, search]);
  const effectiveSelectedId = selectedId && matchingIds.has(selectedId) ? selectedId : null;
  const selectedNode = effectiveSelectedId ? nodeById.get(effectiveSelectedId) : undefined;
  const relatedIds = useMemo(
    () => effectiveSelectedId ? findRelatedNodeIds(effectiveSelectedId, architecture.edges) : null,
    [architecture.edges, effectiveSelectedId],
  );

  const visibleNodes = useMemo(() => nodes.map((node) => ({
    ...node,
    hidden: !matchingIds.has(node.id),
    data: {
      ...node.data,
      dimmed: Boolean(relatedIds && !relatedIds.has(node.id)),
      isSelected: node.id === effectiveSelectedId,
    },
  })), [effectiveSelectedId, matchingIds, nodes, relatedIds]);
  const visibleEdges = useMemo<Edge[]>(() => architecture.edges.map((edge) => {
    const highlighted = Boolean(relatedIds?.has(edge.source) && relatedIds.has(edge.target));
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "smoothstep",
      animated: !effectiveSelectedId,
      hidden: !matchingIds.has(edge.source) || !matchingIds.has(edge.target),
      selectable: false,
      markerEnd: { type: MarkerType.ArrowClosed, color: highlighted || !relatedIds ? "#3b82f6" : "#30363d" },
      style: {
        stroke: highlighted || !relatedIds ? "#3b82f6" : "#30363d",
        strokeWidth: highlighted ? 2 : 1.3,
        opacity: highlighted || !relatedIds ? 0.9 : 0.16,
      },
    };
  }), [architecture.edges, effectiveSelectedId, matchingIds, relatedIds]);
  const outgoing = selectedNode?.metadata?.imports ?? [];
  const incoming = selectedNode?.metadata?.importedBy ?? [];

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
      <div className="min-w-0 overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117]">
        <div className="flex flex-col gap-3 border-b border-[#30363d] p-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b949e]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search files and modules"
              aria-label="Search architecture graph"
              className="h-10 w-full rounded-lg border border-[#30363d] bg-[#161b22] pl-9 pr-3 text-sm text-[#e6edf3] outline-none placeholder:text-[#6e7681] focus:border-[#58a6ff]"
            />
          </label>
          <label className="relative sm:w-48">
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ArchitectureCategory | "all")}
              className="h-10 w-full appearance-none rounded-lg border border-[#30363d] bg-[#161b22] px-3 pr-9 text-sm text-[#c9d1d9] outline-none focus:border-[#58a6ff]"
            >
              <option value="all">All categories</option>
              {architecture.categoryOrder.filter((value) => value !== "repository" && architecture.nodes.some((node) => node.category === value)).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b949e]" />
          </label>
          <span className="shrink-0 text-xs text-[#8b949e]">{matchingIds.size} / {architecture.nodes.length} nodes</span>
        </div>
        {matchingIds.size === 0 ? (
          <div className="grid h-[420px] place-items-center px-5 text-center text-sm text-[#8b949e]">No architecture nodes match the current search and category filter.</div>
        ) : (
          <div className="h-[480px] sm:h-[620px]">
            <ReactFlow
              nodes={visibleNodes}
              edges={visibleEdges}
              nodeTypes={nodeTypes}
              onNodesChange={(changes) => setNodes((current) => applyNodeChanges(changes, current))}
              onNodeClick={(_, node) => setSelectedId(node.id)}
              onPaneClick={() => setSelectedId(null)}
              fitView
              fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
              minZoom={0.08}
              maxZoom={1.8}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable
              proOptions={{ hideAttribution: true }}
              className="architecture-flow"
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#30363d" />
              <Controls showInteractive={false} className="!overflow-hidden !rounded-lg !border !border-[#30363d] !bg-[#161b22] [&>button]:!border-[#30363d] [&>button]:!bg-[#161b22] [&>button]:!fill-[#c9d1d9]" />
              <MiniMap
                pannable
                zoomable
                nodeColor={(node) => (node.data as FlowNodeData).accent}
                maskColor="rgb(13 17 23 / 75%)"
                className="!border !border-[#30363d] !bg-[#161b22]"
              />
            </ReactFlow>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#30363d] px-4 py-3 text-[10px] text-[#8b949e]">
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#3b82f6]" /> Detected import</span>
          <span className="inline-flex items-center gap-1.5"><GitBranch className="h-3 w-3" /> Select a node to highlight its dependency path</span>
          <span className="ml-auto">Drag nodes · scroll to zoom · drag canvas to pan</span>
        </div>
      </div>

      <aside className="min-w-0 rounded-xl border border-[#30363d] bg-[#0d1117]">
        {selectedNode ? (
          <div className="space-y-5 p-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: architecture.categoryColors[selectedNode.category] }}>
                {(() => {
                  const Icon = categoryIcons[selectedNode.category];
                  return <Icon className="h-4 w-4" />;
                })()}
                {selectedNode.category}
              </div>
              <h3 className="mt-3 break-words text-lg font-semibold text-[#e6edf3]">{selectedNode.label}</h3>
              <p className="mt-2 break-all font-mono text-[11px] leading-5 text-[#8b949e]">{selectedNode.filePath}</p>
            </div>
            {selectedNode.description ? <p className="text-sm leading-6 text-[#c9d1d9]">{selectedNode.description}</p> : null}
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Dependencies" value={String(outgoing.length)} />
              <Metric label="Dependents" value={String(incoming.length)} />
            </div>
            <DependencyList title="Imports" paths={outgoing} architecture={architecture} />
            <DependencyList title="Imported by" paths={incoming} architecture={architecture} />
            <p className="border-t border-[#30363d] pt-3 text-[10px] leading-5 text-[#6e7681]">
              Import relationships are detected from source declarations. External package edges are matched against package.json.
            </p>
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-5 py-8 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#30363d] bg-[#161b22] text-[#58a6ff]">
              <FileCode2 className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[#e6edf3]">Inspect a module</h3>
            <p className="mt-1 max-w-xs text-xs leading-5 text-[#8b949e]">Select a node to see its source path and detected dependencies.</p>
          </div>
        )}
        <div className="border-t border-[#30363d] p-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b949e]">Repository metrics</h4>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="Analyzed files" value={`${architecture.metrics.analyzedFiles}/${architecture.metrics.totalFiles}`} />
            <Metric label="Graph edges" value={String(architecture.metrics.totalEdges)} />
            <Metric label="Graph nodes" value={String(architecture.metrics.totalNodes)} />
            <Metric label="Cycles" value={String(architecture.metrics.circularDependencies)} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#8b949e]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-[#e6edf3]">{value}</p>
    </div>
  );
}

function DependencyList({
  title,
  paths,
  architecture,
}: {
  title: string;
  paths: string[];
  architecture: RepositoryArchitecture;
}) {
  const nodes = new Map(architecture.nodes.map((node) => [node.id, node]));

  return (
    <section>
      <h4 className="mb-2 text-xs font-semibold text-[#c9d1d9]">{title} <span className="text-[#6e7681]">({paths.length})</span></h4>
      {paths.length ? (
        <ul className="max-h-40 space-y-1 overflow-auto">
          {paths.map((path) => (
            <li key={path} className="truncate rounded-md bg-[#161b22] px-2 py-1.5 font-mono text-[10px] text-[#8b949e]" title={nodes.get(path)?.filePath ?? path}>
              {nodes.get(path)?.filePath ?? path}
            </li>
          ))}
        </ul>
      ) : <p className="text-[11px] text-[#6e7681]">No detected dependencies.</p>}
    </section>
  );
}

export function RepositoryArchitectureGraph({
  architecture,
  error,
  loading = false,
}: {
  architecture?: RepositoryArchitecture | null;
  error?: string;
  loading?: boolean;
}) {
  if (loading) return <GraphLoadingState />;

  if (!architecture) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <h3 className="font-semibold text-[#e6edf3]">Architecture graph unavailable</h3>
            <p className="mt-1 text-sm leading-6 text-[#c9d1d9]">{error ?? "No source graph could be generated for this repository."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#58a6ff]">Architecture map</p>
          <h2 className="mt-1 text-xl font-semibold text-[#e6edf3]">{architecture.repository}</h2>
          <p className="mt-1 text-xs text-[#8b949e]">
            {architecture.languages.join(" · ") || "Language not detected"}
            {architecture.frameworks.length ? ` · ${architecture.frameworks.join(" · ")}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Metric label="Files analyzed" value={`${architecture.metrics.analyzedFiles} / ${architecture.metrics.totalFiles}`} />
          <Metric label="Connections" value={String(architecture.metrics.totalEdges)} />
          <Metric label="Circular groups" value={String(architecture.metrics.circularDependencies)} />
        </div>
      </div>
      {architecture.warnings.length ? (
        <div className="space-y-1 rounded-lg border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-xs leading-5 text-amber-100">
          {architecture.warnings.map((warning) => <p key={warning}>{warning}</p>)}
        </div>
      ) : null}
      {error ? <p className="rounded-lg border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-xs text-amber-100">{error}</p> : null}
      {architecture.nodes.length > 1 ? (
        <ReactFlowProvider>
          <ArchitectureGraphCanvas architecture={architecture} />
        </ReactFlowProvider>
      ) : (
        <div className="rounded-xl border border-dashed border-[#30363d] bg-[#0d1117] p-8 text-center">
          <p className="font-medium text-[#e6edf3]">No source dependencies were detected.</p>
          <p className="mt-2 text-sm text-[#8b949e]">The repository tree was available, but no supported source files could be analyzed.</p>
        </div>
      )}
    </div>
  );
}
