import cytoscape, {
  type Core,
  type EdgeSingular,
  type ElementDefinition,
  type NodeSingular,
} from "cytoscape";

type NodeKind = "caso" | "persona" | "organizacion" | "documento";
type FocusKind = NodeKind | "inventario";
type EdgeKind = "procesal" | "institucional" | "caso_caso" | "documental";

interface GraphNode {
  id: string;
  rawId: string;
  kind: NodeKind;
  label: string;
  sublabel?: string;
  href?: string;
  search: string;
  meta?: Record<string, string | number | boolean | undefined>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  label: string;
  detail?: string;
  date?: string;
  sourceLevel?: number;
  meta?: Record<string, string | number | boolean | undefined>;
}

interface GraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const EDGE_LABEL: Record<EdgeKind, string> = {
  procesal: "Procesal",
  institucional: "Institucional",
  caso_caso: "Caso-caso",
  documental: "Documental",
};

const FOCUS_LABEL: Record<FocusKind, string> = {
  inventario: "Inventario completo",
  caso: "Caso",
  persona: "Persona",
  organizacion: "Organización",
  documento: "Documento",
};

const LAYOUT_LABEL: Record<string, string> = {
  cose: "Red viva",
  breadthfirst: "Profundidad",
};

const NODE_LABEL: Record<NodeKind, string> = {
  caso: "Caso",
  persona: "Persona",
  organizacion: "Organización",
  documento: "Documento",
};

function checkboxSummary(root: ParentNode, selector: string): string {
  const inputs = qsa<HTMLInputElement>(root, selector);
  const checked = inputs.filter((input) => input.checked);
  if (checked.length === 0) return "Ninguno";
  if (checked.length === inputs.length) return "Todos";
  return checked
    .map((input) => {
      const label = input.closest("label");
      return label?.textContent?.replace(/\s+/g, " ").trim() ?? input.value;
    })
    .join(", ");
}

function checkboxSummaryCompact(root: ParentNode, selector: string): string | null {
  const summary = checkboxSummary(root, selector);
  if (summary === "Todos") return null;
  return summary.split(", ").join(" · ");
}

function checksMatchDefault<T extends string>(
  root: ParentNode,
  selector: string,
  defaults: Set<T>,
): boolean {
  const checked = getChecked<T>(root, selector);
  if (checked.size !== defaults.size) return false;
  return [...defaults].every((value) => checked.has(value));
}

function renderFilterSummary(root: HTMLElement) {
  const panel = qs<HTMLElement>(root, "[data-graph-filter-summary]");
  if (!panel) return;

  const focusType = getFocusKind(root);
  const focusSelect = qs<HTMLSelectElement>(root, "[data-graph-focus-id]");
  const depth = qs<HTMLSelectElement>(root, "[data-graph-depth]")?.value ?? "1";
  const layout =
    qs<HTMLSelectElement>(root, "[data-graph-layout]")?.value ?? "cose";

  const context: string[] = [];
  if (focusType === "inventario") {
    context.push(FOCUS_LABEL.inventario);
  } else {
    const focusName =
      focusSelect?.selectedOptions[0]?.textContent?.replace(/\s+/g, " ").trim() ??
      "Sin foco";
    context.push(`${FOCUS_LABEL[focusType]}: ${focusName}`, `p.${depth}`);
  }
  context.push(LAYOUT_LABEL[layout] ?? layout);

  panel.replaceChildren();
  const primary = document.createElement("p");
  primary.className = "graph-panel__summary-line";
  primary.textContent = context.join(" · ");
  panel.append(primary);

  const edgesDefault = checksMatchDefault(
    root,
    "[data-edge-kind]",
    DEFAULT_EDGE_KINDS,
  );
  const nodesDefault = checksMatchDefault(
    root,
    "[data-node-kind]",
    DEFAULT_NODE_KINDS,
  );
  if (edgesDefault && nodesDefault) return;

  const filters: string[] = [];
  const relations = checkboxSummaryCompact(root, "[data-edge-kind]");
  const nodes = checkboxSummaryCompact(root, "[data-node-kind]");
  if (relations) filters.push(relations);
  if (nodes) filters.push(nodes);

  if (filters.length > 0) {
    const secondary = document.createElement("p");
    secondary.className = "graph-panel__summary-line";
    secondary.textContent = filters.join(" · ");
    panel.append(secondary);
  }
}

const DEFAULT_EDGE_KINDS = new Set<EdgeKind>([
  "procesal",
  "institucional",
  "caso_caso",
]);
const DEFAULT_NODE_KINDS = new Set<NodeKind>([
  "caso",
  "persona",
  "organizacion",
]);
const FOCUS_KINDS: FocusKind[] = [
  "inventario",
  "caso",
  "persona",
  "organizacion",
  "documento",
];
const MESH_DRAG_SCRATCH = "graphMeshDragLastPosition";
const renderedEdgesByRoot = new WeakMap<HTMLElement, Map<string, GraphEdge>>();

function qs<T extends Element>(root: ParentNode, selector: string): T | null {
  return root.querySelector<T>(selector);
}

function qsa<T extends Element>(root: ParentNode, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function getChecked<T extends string>(
  root: ParentNode,
  selector: string,
): Set<T> {
  return new Set(
    qsa<HTMLInputElement>(root, selector)
      .filter((input) => input.checked)
      .map((input) => input.value as T),
  );
}

function shortDetail(value: string | undefined, max = 220): string {
  const flat = (value ?? "").replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const slice = flat.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 90 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

function shortNodeLabel(value: string, kind: NodeKind): string {
  const max = kind === "caso" ? 28 : 22;
  const flat = value.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const slice = flat.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 9 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

function nodeById(payload: GraphPayload): Map<string, GraphNode> {
  return new Map(payload.nodes.map((node) => [node.id, node]));
}

function getFocusKind(root: HTMLElement): FocusKind {
  return (qs<HTMLSelectElement>(root, "[data-graph-focus-type]")?.value ??
    "inventario") as FocusKind;
}

function getFocusNodeId(root: HTMLElement): string {
  const type = getFocusKind(root);
  const id = qs<HTMLSelectElement>(root, "[data-graph-focus-id]")?.value ?? "";
  if (type === "inventario") return "";
  return `${type}:${id}`;
}

function closeGraphSelect(widget: HTMLElement) {
  widget.classList.remove("gsel--open");
  const trigger = qs<HTMLButtonElement>(widget, "[data-gsel-trigger]");
  const menu = qs<HTMLElement>(widget, "[data-gsel-menu]");
  if (trigger) trigger.setAttribute("aria-expanded", "false");
  if (menu) menu.hidden = true;
}

function openGraphSelect(widget: HTMLElement) {
  qsa<HTMLElement>(document, ".gsel--open").forEach((openWidget) => {
    if (openWidget !== widget) closeGraphSelect(openWidget);
  });
  widget.classList.add("gsel--open");
  const trigger = qs<HTMLButtonElement>(widget, "[data-gsel-trigger]");
  const menu = qs<HTMLElement>(widget, "[data-gsel-menu]");
  if (trigger) trigger.setAttribute("aria-expanded", "true");
  if (menu) menu.hidden = false;
  qs<HTMLInputElement>(widget, "[data-gsel-search]")?.focus();
}

function refreshGraphSelect(select: HTMLSelectElement | null) {
  if (!select) return;
  const widget =
    select.nextElementSibling instanceof HTMLElement &&
    select.nextElementSibling.matches("[data-gsel]")
      ? select.nextElementSibling
      : null;
  if (!widget) return;

  const trigger = qs<HTMLButtonElement>(widget, "[data-gsel-trigger]");
  const label = qs<HTMLElement>(widget, "[data-gsel-label]");
  const menu = qs<HTMLElement>(widget, "[data-gsel-menu]");
  const selected = select.selectedOptions[0] ?? select.options[0];
  widget.classList.toggle("gsel--disabled", select.disabled);
  if (trigger) {
    trigger.disabled = select.disabled;
    trigger.setAttribute("aria-disabled", String(select.disabled));
  }
  if (label) label.textContent = selected?.textContent ?? "";
  if (!menu) return;

  menu.textContent = "";
  const options = Array.from(select.options);
  const optionButtons: HTMLButtonElement[] = [];

  if (options.length > 8) {
    const searchItem = document.createElement("li");
    searchItem.className = "gsel__search-row";
    const search = document.createElement("input");
    search.type = "search";
    search.className = "gsel__search";
    search.placeholder = "Buscar...";
    search.autocomplete = "off";
    search.dataset.gselSearch = "";
    search.addEventListener("click", (event) => event.stopPropagation());
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeGraphSelect(widget);
        trigger?.focus();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        optionButtons.find((button) => !button.hidden)?.focus();
      }
    });
    search.addEventListener("input", () => {
      const query = search.value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();
      optionButtons.forEach((button) => {
        const labelText = (button.textContent ?? "")
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase();
        const hidden = query.length > 0 && !labelText.includes(query);
        button.hidden = hidden;
        button.closest("li")!.hidden = hidden;
      });
    });
    searchItem.append(search);
    menu.append(searchItem);
  }

  options.forEach((option) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gsel__option";
    button.role = "option";
    button.dataset.value = option.value;
    button.textContent = option.textContent;
    button.setAttribute(
      "aria-selected",
      option.value === select.value ? "true" : "false",
    );
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      select.value = option.value;
      refreshGraphSelect(select);
      select.dispatchEvent(new Event("change", { bubbles: true }));
      closeGraphSelect(widget);
      trigger?.focus();
    });
    button.addEventListener("keydown", (event) => {
      const visibleOptions = qsa<HTMLButtonElement>(
        menu,
        ".gsel__option",
      ).filter((item) => !item.hidden);
      const currentIndex = visibleOptions.indexOf(button);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        visibleOptions[(currentIndex + 1) % visibleOptions.length]?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (currentIndex <= 0)
          qs<HTMLInputElement>(widget, "[data-gsel-search]")?.focus();
        else visibleOptions[currentIndex - 1]?.focus();
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        button.click();
      } else if (event.key === "Escape") {
        closeGraphSelect(widget);
        trigger?.focus();
      }
    });
    optionButtons.push(button);
    item.append(button);
    menu.append(item);
  });
}

function enhanceGraphSelects(root: HTMLElement) {
  const globalWindow = window as Window & {
    __graphSelectClickInited?: boolean;
  };
  if (!globalWindow.__graphSelectClickInited) {
    globalWindow.__graphSelectClickInited = true;
    document.addEventListener("click", (event) => {
      qsa<HTMLElement>(document, ".gsel--open").forEach((widget) => {
        if (!widget.contains(event.target as Node)) closeGraphSelect(widget);
      });
    });
  }

  for (const select of qsa<HTMLSelectElement>(root, "[data-graph-select]")) {
    if (select.dataset.gselEnhanced === "true") {
      refreshGraphSelect(select);
      continue;
    }
    select.dataset.gselEnhanced = "true";
    const widget = document.createElement("div");
    widget.className = "gsel";
    widget.dataset.gsel = "";
    widget.innerHTML = `
      <button type="button" class="gsel__trigger" aria-haspopup="listbox" aria-expanded="false" data-gsel-trigger>
        <span class="gsel__label" data-gsel-label></span>
        <span class="gsel__caret" aria-hidden="true"></span>
      </button>
      <ul class="gsel__menu" role="listbox" data-gsel-menu hidden></ul>
    `;
    const trigger = qs<HTMLButtonElement>(widget, "[data-gsel-trigger]");
    trigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (select.disabled) return;
      widget.classList.contains("gsel--open")
        ? closeGraphSelect(widget)
        : openGraphSelect(widget);
    });
    trigger?.addEventListener("keydown", (event) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openGraphSelect(widget);
        qs<HTMLButtonElement>(widget, ".gsel__option")?.focus();
      } else if (event.key === "Escape") {
        closeGraphSelect(widget);
      }
    });
    select.insertAdjacentElement("afterend", widget);
    refreshGraphSelect(select);
  }
}

function refreshGraphSelects(root: HTMLElement) {
  qsa<HTMLSelectElement>(root, "[data-graph-select]").forEach(
    refreshGraphSelect,
  );
}

function updateFocusOptions(root: HTMLElement, payload: GraphPayload) {
  const typeSelect = qs<HTMLSelectElement>(root, "[data-graph-focus-type]");
  const idSelect = qs<HTMLSelectElement>(root, "[data-graph-focus-id]");
  const depthSelect = qs<HTMLSelectElement>(root, "[data-graph-depth]");
  if (!typeSelect || !idSelect) return;

  const type = typeSelect.value as FocusKind;
  if (type === "inventario") {
    idSelect.textContent = "";
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Todas las entidades publicables";
    idSelect.append(option);
    idSelect.disabled = true;
    if (depthSelect) depthSelect.disabled = true;
    refreshGraphSelect(idSelect);
    refreshGraphSelect(depthSelect ?? null);
    return;
  }

  idSelect.disabled = false;
  if (depthSelect) depthSelect.disabled = false;
  const current = idSelect.value;
  const nodes = payload.nodes
    .filter((node) => node.kind === type)
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
  idSelect.textContent = "";
  for (const node of nodes) {
    const option = document.createElement("option");
    option.value = node.rawId;
    option.textContent = node.label;
    idSelect.append(option);
  }
  if (nodes.some((node) => node.rawId === current)) {
    idSelect.value = current;
  } else if (nodes[0]) {
    idSelect.value = nodes[0].rawId;
  }
  refreshGraphSelect(idSelect);
  refreshGraphSelect(depthSelect ?? null);
}

function parseUrlState(root: HTMLElement, payload: GraphPayload) {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("focus") as FocusKind | null;
  const id = params.get("id");
  const depth = params.get("depth");
  const layout = params.get("layout");
  const typeSelect = qs<HTMLSelectElement>(root, "[data-graph-focus-type]");
  const idSelect = qs<HTMLSelectElement>(root, "[data-graph-focus-id]");
  const depthSelect = qs<HTMLSelectElement>(root, "[data-graph-depth]");
  const layoutSelect = qs<HTMLSelectElement>(root, "[data-graph-layout]");

  if (type && FOCUS_KINDS.includes(type) && typeSelect) {
    typeSelect.value = type;
  }
  updateFocusOptions(root, payload);
  if (
    id &&
    idSelect &&
    typeSelect?.value !== "inventario" &&
    payload.nodes.some(
      (node) => node.kind === typeSelect?.value && node.rawId === id,
    )
  ) {
    idSelect.value = id;
  }
  if (depth && depthSelect && ["1", "2", "3"].includes(depth))
    depthSelect.value = depth;
  if (layout && layoutSelect && ["breadthfirst", "cose"].includes(layout))
    layoutSelect.value = layout;
  refreshGraphSelects(root);
}

function pushUrlState(root: HTMLElement) {
  const type = getFocusKind(root);
  const id = qs<HTMLSelectElement>(root, "[data-graph-focus-id]")?.value ?? "";
  const depth = qs<HTMLSelectElement>(root, "[data-graph-depth]")?.value ?? "1";
  const layout =
    qs<HTMLSelectElement>(root, "[data-graph-layout]")?.value ?? "cose";
  const params = new URLSearchParams({ focus: type, layout });
  if (type !== "inventario") {
    params.set("id", id);
    params.set("depth", depth);
  }
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}?${params.toString()}`,
  );
}

function allowedSubgraph(
  root: HTMLElement,
  payload: GraphPayload,
): {
  nodes: Set<string>;
  edges: GraphEdge[];
  depthByNode: Map<string, number>;
} {
  const edgeKinds = getChecked<EdgeKind>(root, "[data-edge-kind]");
  const nodeKinds = getChecked<NodeKind>(root, "[data-node-kind]");
  const focusType = getFocusKind(root);
  const focus = getFocusNodeId(root);
  const edgePool = payload.edges.filter((edge) => edgeKinds.has(edge.kind));

  if (focusType === "inventario" || !focus) {
    const visibleNodes = new Set(
      payload.nodes
        .filter((node) => nodeKinds.has(node.kind))
        .map((node) => node.id),
    );
    const visibleEdges = edgePool.filter(
      (edge) => visibleNodes.has(edge.source) && visibleNodes.has(edge.target),
    );
    return {
      nodes: visibleNodes,
      edges: visibleEdges,
      depthByNode: new Map(Array.from(visibleNodes).map((id) => [id, 1])),
    };
  }

  const depth = Number(
    qs<HTMLSelectElement>(root, "[data-graph-depth]")?.value ?? "1",
  );
  const adjacency = new Map<string, GraphEdge[]>();
  for (const edge of edgePool) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, []);
    adjacency.get(edge.source)!.push(edge);
    adjacency.get(edge.target)!.push(edge);
  }

  const visibleNodes = new Set<string>([focus]);
  const visibleEdges = new Map<string, GraphEdge>();
  const depthByNode = new Map<string, number>([[focus, 0]]);
  const queue: Array<{ id: string; depth: number }> = [{ id: focus, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= depth) continue;
    for (const edge of adjacency.get(current.id) ?? []) {
      const next = edge.source === current.id ? edge.target : edge.source;
      const node = payload.nodes.find((item) => item.id === next);
      if (!node) continue;
      if (!nodeKinds.has(node.kind) && next !== focus) continue;
      visibleEdges.set(edge.id, edge);
      if (!visibleNodes.has(next)) {
        visibleNodes.add(next);
        depthByNode.set(next, current.depth + 1);
        queue.push({ id: next, depth: current.depth + 1 });
      }
    }
  }

  return {
    nodes: visibleNodes,
    edges: Array.from(visibleEdges.values()).filter(
      (edge) => visibleNodes.has(edge.source) && visibleNodes.has(edge.target),
    ),
    depthByNode,
  };
}

function edgePairKey(edge: GraphEdge): string {
  return [edge.source, edge.target].sort().join("::");
}

function aggregateEdges(edges: GraphEdge[]): GraphEdge[] {
  const groups = new Map<string, GraphEdge[]>();
  for (const edge of edges) {
    const key = edgePairKey(edge);
    groups.set(key, [...(groups.get(key) ?? []), edge]);
  }

  return Array.from(groups.values()).map((group) => {
    if (group.length === 1) return group[0];
    const first = group[0];
    const kinds = Array.from(new Set(group.map((edge) => edge.kind)));
    const preferredKind =
      (
        ["procesal", "institucional", "caso_caso", "documental"] as EdgeKind[]
      ).find((kind) => kinds.includes(kind)) ?? first.kind;
    const detail = group
      .map(
        (edge) =>
          `${EDGE_LABEL[edge.kind]}: ${edge.label}${edge.detail ? ` - ${shortDetail(edge.detail, 120)}` : ""}`,
      )
      .join("\n");

    return {
      ...first,
      id: `aggregate:${edgePairKey(first)}`,
      kind: preferredKind,
      label: `${group.length} relaciones`,
      detail,
      date: undefined,
      sourceLevel: undefined,
      meta: {
        ...(first.meta ?? {}),
        aggregate_count: group.length,
        aggregate_kinds: kinds.map((kind) => EDGE_LABEL[kind]).join(", "),
      },
    };
  });
}

function renderDetails(
  root: HTMLElement,
  payload: GraphPayload,
  selectedId: string,
) {
  const panel = qs<HTMLElement>(root, "[data-graph-details]");
  if (!panel) return;
  const node = payload.nodes.find((item) => item.id === selectedId);
  const edge =
    renderedEdgesByRoot.get(root)?.get(selectedId) ??
    payload.edges.find((item) => item.id === selectedId);
  if (node) {
    panel.innerHTML = `
      <div class="graph-details__top">
        <p class="graph-details__kind">${NODE_LABEL[node.kind]}</p>
        <h2 class="graph-details__title">${node.href ? `<a href="${node.href}">${node.label}</a>` : node.label}</h2>
      </div>
      ${node.sublabel ? `<p class="graph-details__summary">${node.sublabel}</p>` : ""}
      <dl class="graph-details__meta">
        <div><dt>ID</dt><dd class="mono">${node.rawId}</dd></div>
        <div><dt>Tipo</dt><dd>${NODE_LABEL[node.kind]}</dd></div>
      </dl>
    `;
    return;
  }
  if (edge) {
    const nodes = nodeById(payload);
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    panel.innerHTML = `
      <div class="graph-details__top">
        <p class="graph-details__kind">${EDGE_LABEL[edge.kind]}</p>
        <h2 class="graph-details__title">${edge.label}</h2>
      </div>
      <p class="graph-details__summary">${shortDetail(edge.detail) || "Relación derivada del modelo de datos."}</p>
      <dl class="graph-details__meta">
        <div><dt>Origen</dt><dd>${source?.label ?? edge.source}</dd></div>
        <div><dt>Destino</dt><dd>${target?.label ?? edge.target}</dd></div>
        ${edge.date ? `<div><dt>Fecha</dt><dd class="mono">${edge.date}</dd></div>` : ""}
        ${edge.sourceLevel ? `<div><dt>Nivel</dt><dd>N${edge.sourceLevel}</dd></div>` : ""}
      </dl>
    `;
  }
}

function renderTable(
  root: HTMLElement,
  payload: GraphPayload,
  edges: GraphEdge[],
) {
  const tbody = qs<HTMLTableSectionElement>(root, "[data-graph-table-body]");
  const count = qs<HTMLElement>(root, "[data-graph-visible-count]");
  if (!tbody) return;
  const nodes = nodeById(payload);
  tbody.textContent = "";
  for (const edge of edges) {
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge badge--cat">${EDGE_LABEL[edge.kind]}</span></td>
      <td>${source?.href ? `<a href="${source.href}">${source.label}</a>` : (source?.label ?? edge.source)}</td>
      <td>${edge.label}</td>
      <td>${target?.href ? `<a href="${target.href}">${target.label}</a>` : (target?.label ?? edge.target)}</td>
      <td>${edge.date ? `<span class="c-date">${edge.date}</span>` : '<span class="muted">—</span>'}</td>
    `;
    tbody.append(tr);
  }
  if (count) count.textContent = String(edges.length);
}

function syncPanelButtons(root: HTMLElement) {
  const tableOpen = root.hasAttribute("data-table-open");
  qsa<HTMLButtonElement>(root, "[data-graph-toggle-table]").forEach(
    (button) => {
      button.setAttribute("aria-pressed", String(tableOpen));
      button.classList.toggle("is-active", tableOpen);
      const label = qs<HTMLElement>(button, "[data-graph-table-label]");
      if (label) label.textContent = tableOpen ? "Cerrar relaciones" : "Ver relaciones";
    },
  );
}

function setPanelOpen(
  root: HTMLElement,
  attr: "data-details-open" | "data-table-open",
  open: boolean,
) {
  root.toggleAttribute(attr, open);
  syncPanelButtons(root);
}

function setCenteredState(root: HTMLElement, centered: boolean) {
  const button = qs<HTMLButtonElement>(root, "[data-graph-fit]");
  if (!button) return;
  const label = qs<HTMLElement>(button, "[data-graph-fit-label]");
  if (label) label.textContent = centered ? "Centrado" : "Recentrar";
  button.setAttribute("aria-pressed", String(centered));
  button.classList.toggle("is-active", centered);
}

function graphSeparationFactor(root: HTMLElement): number {
  const value = Number.parseFloat(
    qs<HTMLInputElement>(root, "[data-graph-separation]")?.value ?? "1",
  );
  return Number.isFinite(value) ? value : 1;
}

function syncSeparationControl(root: HTMLElement) {
  const value = graphSeparationFactor(root);
  const label = qs<HTMLElement>(root, "[data-graph-separation-value]");
  if (label) label.textContent = `${value.toFixed(1)}x`;
}

const GRAPH_MIN_ZOOM = 0.18;
const GRAPH_MAX_ZOOM = 3;

function syncZoomControl(root: HTMLElement, cy: Core) {
  const slider = qs<HTMLInputElement>(root, "[data-graph-zoom-slider]");
  if (!slider) return;
  const zoom = Math.min(
    GRAPH_MAX_ZOOM,
    Math.max(GRAPH_MIN_ZOOM, cy.zoom()),
  );
  slider.value = String(zoom);
  slider.setAttribute("aria-valuenow", zoom.toFixed(2));
}

function setGraphZoom(root: HTMLElement, cy: Core, zoom: number) {
  const next = Math.min(
    GRAPH_MAX_ZOOM,
    Math.max(GRAPH_MIN_ZOOM, zoom),
  );
  root.dataset.graphZoomFromControl = "true";
  cy.zoom({
    level: next,
    renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
  });
  syncZoomControl(root, cy);
  delete root.dataset.graphZoomFromControl;
  setCenteredState(root, false);
}

function bindZoomControls(root: HTMLElement, getCy: () => Core | null) {
  const slider = qs<HTMLInputElement>(root, "[data-graph-zoom-slider]");
  const zoomIn = qs<HTMLButtonElement>(root, "[data-graph-zoom-in]");
  const zoomOut = qs<HTMLButtonElement>(root, "[data-graph-zoom-out]");
  if (!slider) return;

  slider.addEventListener("input", () => {
    const cy = getCy();
    if (!cy) return;
    setGraphZoom(root, cy, Number.parseFloat(slider.value));
  });

  zoomIn?.addEventListener("click", () => {
    const cy = getCy();
    if (!cy) return;
    setGraphZoom(root, cy, cy.zoom() * 1.22);
  });

  zoomOut?.addEventListener("click", () => {
    const cy = getCy();
    if (!cy) return;
    setGraphZoom(root, cy, cy.zoom() / 1.22);
  });
}

function setControlsMinimized(root: HTMLElement, minimized: boolean) {
  root.toggleAttribute("data-controls-minimized", minimized);
  const button = qs<HTMLButtonElement>(root, "[data-graph-toggle-controls]");
  const label = qs<HTMLElement>(root, "[data-graph-toggle-label]");
  const summary = qs<HTMLElement>(root, "[data-graph-filter-summary]");
  if (summary) summary.hidden = !minimized;
  if (button) {
    button.setAttribute("aria-expanded", String(!minimized));
    button.setAttribute(
      "aria-label",
      minimized
        ? "Expandir controles del grafo"
        : "Minimizar controles del grafo",
    );
  }
  if (label) label.textContent = minimized ? "Expandir" : "Minimizar";
}

function closeRelationInfoPopovers(root: HTMLElement, except?: HTMLElement) {
  qsa<HTMLButtonElement>(root, "[data-graph-info]").forEach((button) => {
    const popover = button.getAttribute("aria-controls")
      ? document.getElementById(button.getAttribute("aria-controls")!)
      : null;
    if (button === except) return;
    button.setAttribute("aria-expanded", "false");
    if (popover) popover.hidden = true;
  });
}

function clearGraphHighlight(cy: Core) {
  cy.elements().removeClass("is-dim is-highlight is-focus");
  cy.nodes().forEach((node) => {
    node.data("displayLabel", node.data("shortLabel"));
  });
}

function highlightGraphNeighborhood(
  cy: Core,
  targetId: string,
  revealLabel = false,
) {
  const target = cy.getElementById(targetId);
  if (target.empty()) {
    clearGraphHighlight(cy);
    return;
  }
  cy.nodes().forEach((node) => {
    node.data("displayLabel", node.data("shortLabel"));
  });
  let neighborhood;
  if (target.isEdge()) {
    neighborhood = target.union(target.connectedNodes());
  } else {
    neighborhood = (target as NodeSingular).closedNeighborhood();
  }
  cy.elements().removeClass("is-dim is-highlight is-focus");
  cy.elements().difference(neighborhood).addClass("is-dim");
  neighborhood.addClass("is-highlight");
  target.addClass("is-focus");
  if (revealLabel && target.isNode()) {
    target.data("displayLabel", target.data("fullLabel"));
  }
}

function makeElements(
  payload: GraphPayload,
  visibleNodes: Set<string>,
  visibleEdges: GraphEdge[],
  depthByNode: Map<string, number>,
): ElementDefinition[] {
  const elements: ElementDefinition[] = [];
  for (const node of payload.nodes) {
    if (!visibleNodes.has(node.id)) continue;
    elements.push({
      group: "nodes",
      data: {
        id: node.id,
        label: node.label,
        shortLabel: shortNodeLabel(node.label, node.kind),
        fullLabel: node.label,
        displayLabel: shortNodeLabel(node.label, node.kind),
        kind: node.kind,
        href: node.href,
        depth: depthByNode.get(node.id) ?? 0,
      },
      classes: [
        `kind-${node.kind}`,
        `depth-${depthByNode.get(node.id) ?? 0}`,
      ].join(" "),
    });
  }
  for (const edge of visibleEdges) {
    elements.push({
      group: "edges",
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        kind: edge.kind,
      },
      classes: [`edge-${edge.kind}`].join(" "),
    });
  }
  return elements;
}

const GRAPH_NARROW_MAX_WIDTH = 760;

function isNarrowGraphViewport(width: number): boolean {
  return width < GRAPH_NARROW_MAX_WIDTH;
}

function graphViewportWidth(root: HTMLElement): number {
  const canvas = qs<HTMLElement>(root, "[data-graph-canvas]");
  return canvas?.clientWidth ?? window.innerWidth;
}

function fitPaddingForNodeCount(
  nodeCount: number,
  focusType: FocusKind,
  narrow: boolean,
): number {
  const focused = focusType !== "inventario";
  let padding: number;
  if (nodeCount <= 3) padding = focused ? 200 : 168;
  else if (nodeCount <= 8) padding = focused ? 160 : 132;
  else if (nodeCount <= 16) padding = focused ? 128 : 108;
  else if (nodeCount <= 30) padding = focused ? 104 : 88;
  else padding = focused ? 84 : 72;

  if (!narrow) return padding;

  padding = Math.round(padding * 0.38);
  return Math.max(padding, focused ? 24 : 32);
}

function maxZoomForNodeCount(
  nodeCount: number,
  narrow: boolean,
): number | null {
  if (narrow) return null;

  if (nodeCount <= 2) return 0.8;
  if (nodeCount <= 5) return 1.05;
  if (nodeCount <= 10) return 1.35;
  if (nodeCount <= 20) return 1.65;
  return null;
}

function minZoomForNodeCount(
  nodeCount: number,
  narrow: boolean,
): number | null {
  if (!narrow) return null;
  if (nodeCount <= 3) return 1.05;
  if (nodeCount <= 8) return 0.9;
  if (nodeCount <= 16) return 0.72;
  if (nodeCount <= 30) return 0.58;
  return null;
}

function applyViewportFit(
  cy: Core,
  nodeCount: number,
  focusType: FocusKind,
  root?: HTMLElement,
) {
  const narrow = isNarrowGraphViewport(cy.width());
  const padding = fitPaddingForNodeCount(nodeCount, focusType, narrow);
  cy.fit(undefined, padding);

  const maxZoom = maxZoomForNodeCount(nodeCount, narrow);
  if (maxZoom !== null && cy.zoom() > maxZoom) {
    cy.zoom(maxZoom);
    cy.center();
  }

  const minZoom = minZoomForNodeCount(nodeCount, narrow);
  if (minZoom !== null && cy.zoom() < minZoom) {
    cy.zoom(minZoom);
    cy.center();
  }

  if (root) syncZoomControl(root, cy);
}

function layoutFor(root: HTMLElement, focus: string, nodeCount: number) {
  const focusType = getFocusKind(root);
  const narrow = isNarrowGraphViewport(graphViewportWidth(root));
  const padding = fitPaddingForNodeCount(nodeCount, focusType, narrow);
  const separation = graphSeparationFactor(root);
  const name =
    qs<HTMLSelectElement>(root, "[data-graph-layout]")?.value ?? "cose";
  if (name === "cose") {
    const baseRepulsion = focusType === "inventario" ? 21000 : 12500;
    const baseEdgeLength = focusType === "inventario" ? 96 : 126;
    return {
      name: "cose",
      animate: true,
      animationDuration: focusType === "inventario" ? 980 : 820,
      fit: false,
      padding,
      nodeRepulsion: (node: NodeSingular) => {
        const degree = node.connectedEdges().length;
        const hubBoost = Math.min(degree, 14) / 14;
        return baseRepulsion * separation * (1 + hubBoost * (separation - 0.6));
      },
      idealEdgeLength: (edge: EdgeSingular) => {
        const degree = Math.max(
          edge.source().connectedEdges().length,
          edge.target().connectedEdges().length,
        );
        const hubBoost = Math.min(degree, 14) / 14;
        return baseEdgeLength * separation * (1 + hubBoost * 0.42);
      },
      edgeElasticity: 120,
      gravity: (focusType === "inventario" ? 0.18 : 0.11) / Math.max(separation, 0.8),
      numIter: focusType === "inventario" ? 2200 : 1500,
      refresh: 18,
    };
  }
  return {
    name: "breadthfirst",
    roots: focus ? [focus] : undefined,
    directed: false,
    animate: true,
    animationDuration: 450,
    fit: false,
    padding,
    spacingFactor: (nodeCount <= 8 ? 1.55 : 1.25) * separation,
    avoidOverlap: true,
  };
}

function applyLocalMeshDrag(node: NodeSingular) {
  const last = node.scratch(MESH_DRAG_SCRATCH) as
    | { x: number; y: number }
    | undefined;
  const current = node.position();
  if (!last) {
    node.scratch(MESH_DRAG_SCRATCH, { x: current.x, y: current.y });
    return;
  }

  const dx = current.x - last.x;
  const dy = current.y - last.y;
  if (Math.abs(dx) + Math.abs(dy) < 0.5) return;

  const touched = new Set<string>([node.id()]);
  const firstDegree = node.connectedEdges().connectedNodes().difference(node);
  firstDegree.forEach((neighbor) => {
    if (neighbor.grabbed()) return;
    const position = neighbor.position();
    neighbor.position({ x: position.x + dx * 0.18, y: position.y + dy * 0.18 });
    touched.add(neighbor.id());
  });

  const secondDegree = firstDegree
    .connectedEdges()
    .connectedNodes()
    .difference(node)
    .difference(firstDegree);
  secondDegree.forEach((neighbor) => {
    if (neighbor.grabbed() || touched.has(neighbor.id())) return;
    const position = neighbor.position();
    neighbor.position({
      x: position.x + dx * 0.045,
      y: position.y + dy * 0.045,
    });
  });

  node.scratch(MESH_DRAG_SCRATCH, { x: current.x, y: current.y });
}

function renderGraph(
  root: HTMLElement,
  payload: GraphPayload,
  cy: Core | null,
): Core {
  const container = qs<HTMLElement>(root, "[data-graph-canvas]");
  if (!container) throw new Error("Missing graph container");
  const subgraph = allowedSubgraph(root, payload);
  const focus = getFocusNodeId(root);
  const displayEdges = aggregateEdges(subgraph.edges);
  renderedEdgesByRoot.set(
    root,
    new Map(displayEdges.map((edge) => [edge.id, edge])),
  );
  const elements = makeElements(
    payload,
    subgraph.nodes,
    displayEdges,
    subgraph.depthByNode,
  );

  if (!cy) {
    cy = cytoscape({
      container,
      elements,
      minZoom: GRAPH_MIN_ZOOM,
      maxZoom: GRAPH_MAX_ZOOM,
      wheelSensitivity: 1.6,
      style: [
        {
          selector: "node",
          style: {
            width: 18,
            height: 18,
            shape: "ellipse",
            "background-color": "#9aa6b7",
            "border-width": 1.2,
            "border-color": "#ffffff",
            label: "data(displayLabel)",
            color: "#20252c",
            "font-family": "Gill Sans, Lato, Source Sans 3, sans-serif",
            "font-size": 9,
            "font-weight": 600,
            "text-wrap": "none",
            "text-max-width": "96px",
            "text-valign": "bottom",
            "text-halign": "center",
            "text-margin-y": 5,
            "z-index-compare": "manual",
            "z-index": 3,
            "overlay-opacity": 0,
            "transition-property":
              "opacity, border-width, background-color, line-color, target-arrow-color, width",
            "transition-duration": 130,
          },
        },
        {
          selector: "node.kind-caso",
          style: {
            width: 34,
            height: 34,
            "background-color": "#1f3a68",
            "border-color": "#1f3a68",
            color: "#a78100",
            "font-weight": 600,
            "font-size": 14,
            "text-wrap": "wrap",
            "text-max-width": "172px",
            "text-margin-y": 8,
            "text-background-color": "#ffffff",
            "text-background-opacity": 0.8,
            "text-background-padding": "3px",
            "text-background-shape": "rectangle",
            "z-index": 18,
          },
        },
        {
          selector: "node.kind-persona",
          style: {
            width: 22,
            height: 22,
            "background-color": "#ffffff",
            "border-color": "#1f3a68",
          },
        },
        {
          selector: "node.kind-organizacion",
          style: {
            width: 24,
            height: 24,
            "background-color": "#d7dfeb",
            "border-color": "#4a6694",
          },
        },
        {
          selector: "node.kind-documento",
          style: {
            width: 14,
            height: 14,
            "background-color": "#fafafa",
            "border-color": "#8b949e",
            "border-style": "dashed",
            "font-size": 8,
          },
        },
        {
          selector: "node.depth-2, node.depth-3",
          style: {
            opacity: 0.72,
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.2,
            "line-color": "#8b949e",
            "target-arrow-color": "#8b949e",
            "target-arrow-shape": "triangle",
            "target-arrow-fill": "filled",
            "curve-style": "bezier",
            color: "#5d6672",
            "font-size": 0,
            "font-family": "Gill Sans, Lato, Source Sans 3, sans-serif",
            "text-background-color": "#fafafa",
            "text-background-opacity": 0.86,
            "text-background-padding": "2px",
            "text-rotation": "autorotate",
            opacity: 0.22,
            "z-index-compare": "manual",
            "z-index": 0,
            "transition-property":
              "opacity, width, line-color, target-arrow-color",
            "transition-duration": 130,
          },
        },
        {
          selector: "node.is-dim",
          style: {
            opacity: 0.26,
          },
        },
        {
          selector: "edge.is-dim",
          style: {
            opacity: 0.08,
          },
        },
        {
          selector: "node.is-highlight",
          style: {
            opacity: 1,
            "z-index": 14,
          },
        },
        {
          selector: "edge.is-highlight",
          style: {
            opacity: 0.86,
            width: 2,
            "z-index": 2,
          },
        },
        {
          selector: "node.is-focus",
          style: {
            "border-width": 3,
            "border-color": "#c89b00",
            "z-index": 24,
            "text-wrap": "wrap",
            "text-max-width": "158px",
          },
        },
        {
          selector: "node.kind-caso.is-focus",
          style: {
            "font-size": 15,
            "text-max-width": "190px",
            "text-background-opacity": 0.78,
            "text-background-padding": "4px",
            "color": "#c89b00",
            "z-index": 32,
          },
        },
        {
          selector: "edge.is-focus",
          style: {
            opacity: 1,
            width: 2.5,
            "line-color": "#c89b00",
            "target-arrow-color": "#c89b00",
            "z-index": 4,
          },
        },
        {
          selector: "edge.edge-procesal",
          style: {
            "line-color": "#1f3a68",
            "target-arrow-color": "#1f3a68",
          },
        },
        {
          selector: "edge.edge-institucional",
          style: {
            "line-color": "#4a6694",
            "target-arrow-color": "#4a6694",
          },
        },
        {
          selector: "edge.edge-caso_caso",
          style: {
            "line-color": "#c89b00",
            "target-arrow-color": "#c89b00",
            "line-style": "dashed",
          },
        },
        {
          selector: "edge.edge-documental",
          style: {
            "line-color": "#9aa1aa",
            "target-arrow-color": "#9aa1aa",
            "line-style": "dotted",
          },
        },
        {
          selector: ":selected",
          style: {
            "border-width": 3,
            "border-color": "#c89b00",
            "background-color": "#c89b00",
            "line-color": "#c89b00",
            "target-arrow-color": "#c89b00",
          },
        },
      ],
    });
    let lockedHighlightId = "";
    cy.on("mouseover", "node, edge", (event) => {
      if (lockedHighlightId) return;
      highlightGraphNeighborhood(cy!, event.target.id(), true);
    });
    cy.on("mouseout", "node, edge", () => {
      if (lockedHighlightId) return;
      clearGraphHighlight(cy!);
    });
    cy.on("tap", "node, edge", (event) => {
      lockedHighlightId = event.target.id();
      root.dataset.graphSelectedId = lockedHighlightId;
      highlightGraphNeighborhood(cy!, lockedHighlightId, true);
      renderDetails(root, payload, event.target.id());
      if (!root.hasAttribute("data-details-suppressed")) {
        setPanelOpen(root, "data-details-open", true);
      }
    });
    cy.on("tap", (event) => {
      if (event.target !== cy) return;
      lockedHighlightId = "";
      delete root.dataset.graphSelectedId;
      clearGraphHighlight(cy!);
    });
    cy.on("dbltap", "node", (event) => {
      const href = event.target.data("href");
      if (href) window.location.href = href;
    });
    cy.on("pan drag", () => {
      if (root.dataset.graphViewportLocked === "true") return;
      setCenteredState(root, false);
    });
    cy.on("zoom", () => {
      if (root.dataset.graphViewportLocked === "true") return;
      if (root.dataset.graphZoomFromControl === "true") return;
      syncZoomControl(root, cy!);
      setCenteredState(root, false);
    });
    cy.on("grab", "node", (event) => {
      const node = event.target as NodeSingular;
      node.scratch(MESH_DRAG_SCRATCH, node.position());
    });
    cy.on("drag", "node", (event) => {
      if (
        (qs<HTMLSelectElement>(root, "[data-graph-layout]")?.value ??
          "cose") !== "cose"
      )
        return;
      applyLocalMeshDrag(event.target as NodeSingular);
    });
    cy.on("dragfree", "node", (event) => {
      setCenteredState(root, false);
      (event.target as NodeSingular).removeScratch(MESH_DRAG_SCRATCH);
    });
  } else {
    cy.elements().remove();
    cy.add(elements);
  }

  root.dataset.graphViewportLocked = "true";
  const nodeCount = subgraph.nodes.size;
  const focusType = getFocusKind(root);
  const layout = cy.layout(layoutFor(root, focus, nodeCount));
  layout.one("layoutstop", () => {
    applyViewportFit(cy!, nodeCount, focusType, root);
    delete root.dataset.graphViewportLocked;
    setCenteredState(root, true);
  });
  layout.run();
  renderTable(root, payload, displayEdges);
  const visibleNodes = qs<HTMLElement>(root, "[data-graph-node-count]");
  if (visibleNodes) visibleNodes.textContent = String(subgraph.nodes.size);
  if (focus) renderDetails(root, payload, focus);
  renderFilterSummary(root);
  syncPanelButtons(root);
  return cy;
}

function init(root: HTMLElement) {
  const dataEl = qs<HTMLScriptElement>(root, "[data-graph-data]");
  if (!dataEl?.textContent) return;
  const payload = JSON.parse(dataEl.textContent) as GraphPayload;
  const form = qs<HTMLFormElement>(root, "[data-graph-form]");
  if (!form) return;

  for (const input of qsa<HTMLInputElement>(root, "[data-edge-kind]")) {
    input.checked = DEFAULT_EDGE_KINDS.has(input.value as EdgeKind);
  }
  for (const input of qsa<HTMLInputElement>(root, "[data-node-kind]")) {
    input.checked = DEFAULT_NODE_KINDS.has(input.value as NodeKind);
  }

  enhanceGraphSelects(root);
  parseUrlState(root, payload);
  let cy: Core | null = null;
  const rerender = () => {
    pushUrlState(root);
    syncSeparationControl(root);
    cy = renderGraph(root, payload, cy);
  };

  bindZoomControls(root, () => cy);
  qsa<HTMLButtonElement>(root, "[data-graph-info]").forEach((button) => {
    const popover = button.getAttribute("aria-controls")
      ? document.getElementById(button.getAttribute("aria-controls")!)
      : null;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = button.getAttribute("aria-expanded") === "true";
      closeRelationInfoPopovers(root, button);
      button.setAttribute("aria-expanded", String(!open));
      if (popover) popover.hidden = open;
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeRelationInfoPopovers(root);
        button.focus();
      }
    });
  });
  document.addEventListener("click", (event) => {
    if (root.contains(event.target as Node)) {
      const target = event.target as HTMLElement;
      if (target.closest("[data-graph-info]") || target.closest(".graph-info-popover")) return;
    }
    closeRelationInfoPopovers(root);
  });
  qs<HTMLButtonElement>(root, "[data-graph-toggle-controls]")?.addEventListener(
    "click",
    () => {
      setControlsMinimized(
        root,
        !root.hasAttribute("data-controls-minimized"),
      );
    },
  );

  qs<HTMLSelectElement>(root, "[data-graph-focus-type]")?.addEventListener(
    "change",
    () => {
      updateFocusOptions(root, payload);
      refreshGraphSelects(root);
    },
  );
  form.addEventListener("input", rerender);
  form.addEventListener("change", rerender);
  form.addEventListener("submit", (event) => event.preventDefault());
  qs<HTMLButtonElement>(root, "[data-graph-fit]")?.addEventListener(
    "click",
    () => {
      if (!cy) return;
      root.dataset.graphViewportLocked = "true";
      applyViewportFit(cy, cy.nodes().length, getFocusKind(root), root);
      setCenteredState(root, true);
      window.setTimeout(() => {
        delete root.dataset.graphViewportLocked;
      }, 90);
    },
  );
  qs<HTMLButtonElement>(root, "[data-graph-close-details]")?.addEventListener(
    "click",
    () => {
      setPanelOpen(root, "data-details-open", false);
    },
  );
  qs<HTMLInputElement>(root, "[data-graph-suppress-details]")?.addEventListener(
    "change",
    (event) => {
      const input = event.currentTarget as HTMLInputElement;
      root.toggleAttribute("data-details-suppressed", input.checked);
      if (input.checked) {
        setPanelOpen(root, "data-details-open", false);
      } else {
        syncPanelButtons(root);
      }
    },
  );
  qsa<HTMLButtonElement>(root, "[data-graph-toggle-table]").forEach(
    (button) => {
      button.addEventListener("click", () => {
        setPanelOpen(
          root,
          "data-table-open",
          !root.hasAttribute("data-table-open"),
        );
      });
    },
  );
  qs<HTMLButtonElement>(root, "[data-graph-copy]")?.addEventListener(
    "click",
    async () => {
      const status = qs<HTMLElement>(root, "[data-graph-copy-status]");
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (status) status.textContent = "Enlace copiado";
      } catch {
        if (status) status.textContent = "No se pudo copiar";
      }
    },
  );

  rerender();
}

document.querySelectorAll<HTMLElement>("[data-graph-root]").forEach(init);
