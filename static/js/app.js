// -----------------------------------------------------------------------------
// DOM helpers and configuration
// -----------------------------------------------------------------------------

function getElement(id) {
  return document.getElementById(id);
}

const DEFAULT_ARRAY_SIZE = 24;
const MIN_ARRAY_SIZE = 4;
const MAX_ARRAY_SIZE = 48;
const MIN_VALUE = 12;
const MAX_VALUE = 93;

const algorithms = {
  "bubble-sort": {
    name: "Bubble Sort",
    category: "sorting",
    time: "O(n²)",
    space: "O(1)",
    cue: "Repeatedly move the largest unsorted value to the end.",
  },
  "selection-sort": {
    name: "Selection Sort",
    category: "sorting",
    time: "O(n²)",
    space: "O(1)",
    cue: "Grow a sorted region by selecting the next minimum.",
  },
  "insertion-sort": {
    name: "Insertion Sort",
    category: "sorting",
    time: "O(n²)",
    space: "O(1)",
    cue: "Insert each new value into the sorted portion on the left.",
  },
  "quick-sort": {
    name: "Quick Sort",
    category: "sorting",
    time: "O(n log n)",
    space: "O(log n)",
    cue: "Partition around a pivot, then solve each smaller region.",
  },
  "merge-sort": {
    name: "Merge Sort",
    category: "sorting",
    time: "O(n log n)",
    space: "O(n)",
    cue: "Split the array, sort both halves, then merge them.",
  },
  "linear-search": {
    name: "Linear Search",
    category: "searching",
    time: "O(n)",
    space: "O(1)",
    cue: "Check each value from left to right until the target appears.",
  },
  "binary-search": {
    name: "Binary Search",
    category: "searching",
    time: "O(log n)",
    space: "O(1)",
    cue: "Halve the remaining search space after every comparison.",
  },
  bfs: {
    name: "Breadth-first Search",
    category: "graphs",
    time: "O(V + E)",
    space: "O(V)",
    cue: "Explore the graph layer by layer using a queue.",
    pseudocode: [
      "enqueue the start node",
      "dequeue the next node",
      "visit each undiscovered neighbor",
      "repeat until the queue is empty",
    ],
  },
  dfs: {
    name: "Depth-first Search",
    category: "graphs",
    time: "O(V + E)",
    space: "O(V)",
    cue: "Follow one path deeply before backtracking.",
    pseudocode: [
      "visit the current node",
      "inspect each outgoing edge",
      "recurse into an unvisited neighbor",
      "backtrack when no neighbor remains",
    ],
  },
  dijkstra: {
    name: "Dijkstra's Shortest Path",
    category: "graphs",
    time: "O((V + E) log V)",
    space: "O(V)",
    cue: "Always settle the closest unfinished node, then relax its edges.",
    pseudocode: [
      "set start distance to zero",
      "take the closest unsettled node",
      "relax every outgoing edge",
      "repeat until no reachable node remains",
    ],
  },
  "topological-sort": {
    name: "Topological Sort (DFS)",
    category: "graphs",
    time: "O(V + E)",
    space: "O(V)",
    cue: "Add each node to the front only after all descendants finish.",
    pseudocode: [
      "start DFS from every unvisited node",
      "explore each outgoing edge",
      "finish all descendants first",
      "prepend the finished node to the order",
    ],
  },
  kahn: {
    name: "Kahn's Algorithm",
    category: "graphs",
    time: "O(V + E)",
    space: "O(V)",
    cue: "Repeatedly remove nodes whose in-degree has reached zero.",
    pseudocode: [
      "compute every node's in-degree",
      "enqueue all zero in-degree nodes",
      "remove one node and emit it",
      "decrease neighbors and enqueue new zeros",
    ],
  },
};

const GRAPH_NODES = [
  { id: "A", x: 65, y: 150 },
  { id: "B", x: 220, y: 62 },
  { id: "C", x: 220, y: 238 },
  { id: "D", x: 395, y: 48 },
  { id: "E", x: 405, y: 174 },
  { id: "F", x: 575, y: 70 },
  { id: "G", x: 570, y: 235 },
  { id: "H", x: 710, y: 150 },
];

const DEFAULT_GRAPH_EDGES = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "B", to: "D", weight: 5 },
  { from: "B", to: "E", weight: 7 },
  { from: "C", to: "B", weight: 1 },
  { from: "C", to: "E", weight: 3 },
  { from: "D", to: "F", weight: 2 },
  { from: "E", to: "D", weight: 4 },
  { from: "E", to: "F", weight: 4 },
  { from: "E", to: "G", weight: 7 },
  { from: "F", to: "H", weight: 3 },
  { from: "G", to: "H", weight: 1 },
];

const appState = {
  values: [],
  originalValues: [],
  trace: [],
  currentStep: 0,
  totalSteps: 0,
  events: [],
  comparisons: 0,
  swaps: 0,
  arrayAccesses: 0,
  isPlaying: false,
  playbackTimer: null,
  algorithmId: "bubble-sort",
  category: "sorting",
  graphEdges: DEFAULT_GRAPH_EDGES.map((edge) => ({ ...edge })),
  graphVisited: [],
  graphFrontier: [],
  graphOrder: [],
  graphActiveNode: null,
  graphActiveEdge: null,
  graphRelaxedEdges: [],
  graphNodeValues: {},
  graphEdgesChecked: 0,
};

// -----------------------------------------------------------------------------
// Trace generation
// -----------------------------------------------------------------------------

function createRandomArray(size = DEFAULT_ARRAY_SIZE) {
  const valueRange = MAX_VALUE - MIN_VALUE + 1;

  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * valueRange) + MIN_VALUE,
  );
}

function createCompareStep(values, firstIndex, secondIndex) {
  return {
    type: "compare",
    indices: [firstIndex, secondIndex],
    message: `Comparing ${values[firstIndex]} and ${values[secondIndex]}`,
  };
}

function createCompletedStep(values) {
  return {
    type: "done",
    indices: values.map((_, index) => index),
    message: "Array sorted. Nice work.",
  };
}

function createBubbleSortTrace(values) {
  const workingValues = [...values];
  const trace = [];

  for (
    let unsortedEnd = workingValues.length - 1;
    unsortedEnd > 0;
    unsortedEnd -= 1
  ) {
    for (let index = 0; index < unsortedEnd; index += 1) {
      const nextIndex = index + 1;
      trace.push(createCompareStep(workingValues, index, nextIndex));

      if (workingValues[index] <= workingValues[nextIndex]) {
        continue;
      }

      [workingValues[index], workingValues[nextIndex]] = [
        workingValues[nextIndex],
        workingValues[index],
      ];

      trace.push({
        type: "swap",
        indices: [index, nextIndex],
        message: `Swapped positions ${index} and ${nextIndex}`,
      });
    }
  }

  trace.push(createCompletedStep(workingValues));
  return trace;
}

function createSelectionSortTrace(values) {
  const workingValues = [...values];
  const trace = [];

  for (
    let currentIndex = 0;
    currentIndex < workingValues.length - 1;
    currentIndex += 1
  ) {
    let minimumIndex = currentIndex;

    for (
      let candidateIndex = currentIndex + 1;
      candidateIndex < workingValues.length;
      candidateIndex += 1
    ) {
      trace.push(
        createCompareStep(workingValues, minimumIndex, candidateIndex),
      );

      if (workingValues[candidateIndex] < workingValues[minimumIndex]) {
        minimumIndex = candidateIndex;
      }
    }

    if (minimumIndex === currentIndex) {
      continue;
    }

    [workingValues[currentIndex], workingValues[minimumIndex]] = [
      workingValues[minimumIndex],
      workingValues[currentIndex],
    ];

    trace.push({
      type: "swap",
      indices: [currentIndex, minimumIndex],
      message: `Placed minimum at index ${currentIndex}`,
    });
  }

  trace.push(createCompletedStep(workingValues));
  return trace;
}

function createInsertionSortTrace(values) {
  const workingValues = [...values];
  const trace = [];

  for (
    let currentIndex = 1;
    currentIndex < workingValues.length;
    currentIndex += 1
  ) {
    let insertionIndex = currentIndex;

    while (insertionIndex > 0) {
      const previousIndex = insertionIndex - 1;
      trace.push(
        createCompareStep(workingValues, previousIndex, insertionIndex),
      );

      if (workingValues[previousIndex] <= workingValues[insertionIndex]) {
        break;
      }

      [workingValues[previousIndex], workingValues[insertionIndex]] = [
        workingValues[insertionIndex],
        workingValues[previousIndex],
      ];

      trace.push({
        type: "swap",
        indices: [previousIndex, insertionIndex],
        message: `Inserted value at index ${previousIndex}`,
      });

      insertionIndex -= 1;
    }
  }

  trace.push(createCompletedStep(workingValues));
  return trace;
}

function createLinearSearchTrace(values) {
  const targetIndex = Math.floor(values.length * 0.62);
  const targetValue = values[targetIndex];
  const trace = [];

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    trace.push({
      type: "compare",
      indices: [index],
      message: `Checking ${value}`,
    });

    if (value === targetValue) {
      trace.push({
        type: "found",
        indices: [index],
        message: `Found ${targetValue} at index ${index}`,
      });
      break;
    }
  }

  return trace;
}

function createBinarySearchTrace(values) {
  const sortedValues = [...values].sort((first, second) => first - second);
  const targetIndex = Math.floor(sortedValues.length * 0.62);
  const targetValue = sortedValues[targetIndex];
  const trace = [{ type: "reset", values: sortedValues, indices: [] }];

  let lowIndex = 0;
  let highIndex = sortedValues.length - 1;

  while (lowIndex <= highIndex) {
    const middleIndex = Math.floor((lowIndex + highIndex) / 2);
    const middleValue = sortedValues[middleIndex];

    trace.push({
      type: "compare",
      indices: [lowIndex, highIndex, middleIndex],
      message: `Checking midpoint ${middleValue}`,
    });

    if (middleValue === targetValue) {
      trace.push({
        type: "found",
        indices: [middleIndex],
        message: `Found ${targetValue} at index ${middleIndex}`,
      });
      break;
    }

    if (middleValue < targetValue) {
      lowIndex = middleIndex + 1;
    } else {
      highIndex = middleIndex - 1;
    }
  }

  return trace;
}

function getOutgoingEdges(nodeId, edges = appState.graphEdges) {
  return edges.filter((edge) => edge.from === nodeId);
}

function createGraphModel() {
  return {
    visited: new Set(),
    frontier: [],
    order: [],
    relaxedEdges: new Set(),
    nodeValues: {},
    edgesChecked: 0,
  };
}

function addGraphStep(trace, model, step) {
  trace.push({
    graph: true,
    type: step.type,
    message: step.message,
    activeNode: step.activeNode ?? null,
    activeEdge: step.activeEdge ?? null,
    visited: [...model.visited],
    frontier: [...model.frontier],
    order: [...model.order],
    relaxedEdges: [...model.relaxedEdges],
    nodeValues: { ...model.nodeValues },
    edgesChecked: model.edgesChecked,
  });
}

function createBreadthFirstTrace() {
  const trace = [];
  const model = createGraphModel();
  const discovered = new Set(["A"]);

  model.frontier.push("A");
  addGraphStep(trace, model, {
    type: "queue",
    activeNode: "A",
    message: "Enqueued start node A",
  });

  while (model.frontier.length > 0) {
    const nodeId = model.frontier.shift();
    model.visited.add(nodeId);
    model.order.push(nodeId);

    addGraphStep(trace, model, {
      type: "visit",
      activeNode: nodeId,
      message: `Visited ${nodeId}; next frontier: ${model.frontier.join(", ") || "empty"}`,
    });

    getOutgoingEdges(nodeId).forEach((edge) => {
      const edgeId = `${edge.from}-${edge.to}`;
      model.edgesChecked += 1;

      addGraphStep(trace, model, {
        type: "inspect-edge",
        activeNode: nodeId,
        activeEdge: edgeId,
        message: `Checked edge ${edge.from} → ${edge.to}`,
      });

      if (discovered.has(edge.to)) {
        return;
      }

      discovered.add(edge.to);
      model.frontier.push(edge.to);
      model.relaxedEdges.add(edgeId);

      addGraphStep(trace, model, {
        type: "queue",
        activeNode: edge.to,
        activeEdge: edgeId,
        message: `Discovered ${edge.to} and added it to the queue`,
      });
    });
  }

  addGraphStep(trace, model, {
    type: "done",
    message: `BFS complete: ${model.order.join(" → ")}`,
  });

  return trace;
}

function createDepthFirstTrace() {
  const trace = [];
  const model = createGraphModel();

  function visit(nodeId) {
    model.visited.add(nodeId);
    model.order.push(nodeId);
    model.frontier.push(nodeId);

    addGraphStep(trace, model, {
      type: "visit",
      activeNode: nodeId,
      message: `Entered ${nodeId}; recursion depth ${model.frontier.length}`,
    });

    getOutgoingEdges(nodeId).forEach((edge) => {
      const edgeId = `${edge.from}-${edge.to}`;
      model.edgesChecked += 1;

      addGraphStep(trace, model, {
        type: "inspect-edge",
        activeNode: nodeId,
        activeEdge: edgeId,
        message: `Exploring ${edge.from} → ${edge.to}`,
      });

      if (!model.visited.has(edge.to)) {
        model.relaxedEdges.add(edgeId);
        visit(edge.to);
      }
    });

    model.frontier.pop();
    addGraphStep(trace, model, {
      type: "finish",
      activeNode: nodeId,
      message: `Finished ${nodeId} and backtracked`,
    });
  }

  visit("A");
  addGraphStep(trace, model, {
    type: "done",
    message: `DFS complete: ${model.order.join(" → ")}`,
  });

  return trace;
}

function createDijkstraTrace() {
  const trace = [];
  const model = createGraphModel();
  const unsettled = new Set(GRAPH_NODES.map((node) => node.id));
  const distances = Object.fromEntries(
    GRAPH_NODES.map((node) => [node.id, Number.POSITIVE_INFINITY]),
  );

  distances.A = 0;
  model.nodeValues = { ...distances };
  model.frontier = ["A"];

  addGraphStep(trace, model, {
    type: "queue",
    activeNode: "A",
    message: "Set distance(A) = 0; every other distance starts at ∞",
  });

  while (unsettled.size > 0) {
    const reachableNodes = [...unsettled].filter((nodeId) =>
      Number.isFinite(distances[nodeId]),
    );

    if (reachableNodes.length === 0) {
      break;
    }

    reachableNodes.sort(
      (first, second) => distances[first] - distances[second],
    );
    const nodeId = reachableNodes[0];
    unsettled.delete(nodeId);
    model.visited.add(nodeId);
    model.order.push(nodeId);
    model.frontier = reachableNodes.slice(1);
    model.nodeValues = { ...distances };

    addGraphStep(trace, model, {
      type: "visit",
      activeNode: nodeId,
      message: `Settled ${nodeId} with shortest distance ${distances[nodeId]}`,
    });

    getOutgoingEdges(nodeId).forEach((edge) => {
      const edgeId = `${edge.from}-${edge.to}`;
      const candidateDistance = distances[nodeId] + edge.weight;
      model.edgesChecked += 1;

      addGraphStep(trace, model, {
        type: "inspect-edge",
        activeNode: nodeId,
        activeEdge: edgeId,
        message: `Try ${edge.from} → ${edge.to}: ${distances[nodeId]} + ${edge.weight}`,
      });

      if (candidateDistance >= distances[edge.to]) {
        return;
      }

      distances[edge.to] = candidateDistance;
      model.nodeValues = { ...distances };
      model.relaxedEdges.add(edgeId);
      model.frontier = [...unsettled]
        .filter((candidate) => Number.isFinite(distances[candidate]))
        .sort((first, second) => distances[first] - distances[second]);

      addGraphStep(trace, model, {
        type: "relax",
        activeNode: edge.to,
        activeEdge: edgeId,
        message: `Updated distance(${edge.to}) to ${candidateDistance}`,
      });
    });
  }

  model.frontier = [];
  model.nodeValues = { ...distances };
  addGraphStep(trace, model, {
    type: "done",
    message: "Shortest paths from A are complete",
  });

  return trace;
}

function createTopologicalTrace() {
  const trace = [];
  const model = createGraphModel();

  function visit(nodeId) {
    model.visited.add(nodeId);
    model.frontier.push(nodeId);

    addGraphStep(trace, model, {
      type: "visit",
      activeNode: nodeId,
      message: `Started DFS at ${nodeId}`,
    });

    getOutgoingEdges(nodeId).forEach((edge) => {
      const edgeId = `${edge.from}-${edge.to}`;
      model.edgesChecked += 1;

      addGraphStep(trace, model, {
        type: "inspect-edge",
        activeNode: nodeId,
        activeEdge: edgeId,
        message: `Checked dependency ${edge.from} → ${edge.to}`,
      });

      if (!model.visited.has(edge.to)) {
        model.relaxedEdges.add(edgeId);
        visit(edge.to);
      }
    });

    model.frontier.pop();
    model.order.unshift(nodeId);

    addGraphStep(trace, model, {
      type: "finish",
      activeNode: nodeId,
      message: `Finished ${nodeId}; prepended it to the topological order`,
    });
  }

  GRAPH_NODES.forEach((node) => {
    if (!model.visited.has(node.id)) {
      visit(node.id);
    }
  });

  addGraphStep(trace, model, {
    type: "done",
    message: `Topological order: ${model.order.join(" → ")}`,
  });

  return trace;
}

function createKahnTrace() {
  const trace = [];
  const model = createGraphModel();
  const inDegrees = Object.fromEntries(GRAPH_NODES.map((node) => [node.id, 0]));

  appState.graphEdges.forEach((edge) => {
    inDegrees[edge.to] += 1;
  });

  model.nodeValues = { ...inDegrees };
  model.frontier = GRAPH_NODES.map((node) => node.id).filter(
    (nodeId) => inDegrees[nodeId] === 0,
  );

  addGraphStep(trace, model, {
    type: "queue",
    activeNode: model.frontier[0],
    message: `Zero in-degree queue: ${model.frontier.join(", ")}`,
  });

  while (model.frontier.length > 0) {
    const nodeId = model.frontier.shift();
    model.visited.add(nodeId);
    model.order.push(nodeId);

    addGraphStep(trace, model, {
      type: "visit",
      activeNode: nodeId,
      message: `Emitted ${nodeId} from the zero in-degree queue`,
    });

    getOutgoingEdges(nodeId).forEach((edge) => {
      const edgeId = `${edge.from}-${edge.to}`;
      inDegrees[edge.to] -= 1;
      model.nodeValues = { ...inDegrees };
      model.edgesChecked += 1;
      model.relaxedEdges.add(edgeId);

      addGraphStep(trace, model, {
        type: "inspect-edge",
        activeNode: edge.to,
        activeEdge: edgeId,
        message: `Removed ${edge.from} → ${edge.to}; in-degree(${edge.to}) = ${inDegrees[edge.to]}`,
      });

      if (inDegrees[edge.to] === 0) {
        model.frontier.push(edge.to);
        addGraphStep(trace, model, {
          type: "queue",
          activeNode: edge.to,
          activeEdge: edgeId,
          message: `${edge.to} reached in-degree 0 and entered the queue`,
        });
      }
    });
  }

  addGraphStep(trace, model, {
    type: "done",
    message:
      model.order.length === GRAPH_NODES.length
        ? `Kahn's order: ${model.order.join(" → ")}`
        : "A cycle prevents a topological ordering",
  });

  return trace;
}

function createGraphTrace(algorithmId) {
  switch (algorithmId) {
    case "bfs":
      return createBreadthFirstTrace();
    case "dfs":
      return createDepthFirstTrace();
    case "dijkstra":
      return createDijkstraTrace();
    case "topological-sort":
      return createTopologicalTrace();
    case "kahn":
      return createKahnTrace();
    default:
      return [];
  }
}

function createAlgorithmTrace(values, algorithmId) {
  switch (algorithmId) {
    case "bubble-sort":
      return createBubbleSortTrace(values);
    case "selection-sort":
      return createSelectionSortTrace(values);
    case "insertion-sort":
      return createInsertionSortTrace(values);
    case "quick-sort":
    case "merge-sort":
      // These visual demos currently reuse the adjacent-comparison animation.
      return createBubbleSortTrace(values);
    case "linear-search":
      return createLinearSearchTrace(values);
    case "binary-search":
      return createBinarySearchTrace(values);
    case "bfs":
    case "dfs":
    case "dijkstra":
    case "topological-sort":
    case "kahn":
      return createGraphTrace(algorithmId);
    default:
      return [];
  }
}

// -----------------------------------------------------------------------------
// Rendering
// -----------------------------------------------------------------------------

function renderBars(highlights = {}) {
  const barsContainer = getElement("bars");
  const largestValue = Math.max(...appState.values, 100);
  barsContainer.innerHTML = "";

  appState.values.forEach((value, index) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${Math.max(6, (value / largestValue) * 100)}%`;

    if (highlights.comparing?.includes(index)) {
      bar.classList.add("comparing");
    }
    if (highlights.swapping?.includes(index)) {
      bar.classList.add("swapping");
    }
    if (
      highlights.sorted?.includes(index) ||
      highlights.visited?.includes(index)
    ) {
      bar.classList.add("sorted");
    }

    barsContainer.appendChild(bar);
  });
}

function isGraphAlgorithm() {
  return algorithms[appState.algorithmId].category === "graphs";
}

function getGraphNode(nodeId) {
  return GRAPH_NODES.find((node) => node.id === nodeId);
}

function getEdgeCoordinates(edge) {
  const source = getGraphNode(edge.from);
  const target = getGraphNode(edge.to);
  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  const distance = Math.hypot(deltaX, deltaY);
  const unitX = deltaX / distance;
  const unitY = deltaY / distance;
  const nodeRadius = 23;
  const arrowPadding = 8;

  return {
    x1: source.x + unitX * nodeRadius,
    y1: source.y + unitY * nodeRadius,
    x2: target.x - unitX * (nodeRadius + arrowPadding),
    y2: target.y - unitY * (nodeRadius + arrowPadding),
    labelX: (source.x + target.x) / 2 - unitY * 10,
    labelY: (source.y + target.y) / 2 + unitX * 10,
  };
}

function getGraphNodeCaption(nodeId) {
  if (appState.algorithmId === "dijkstra") {
    const distance = appState.graphNodeValues[nodeId];
    return `d=${Number.isFinite(distance) ? distance : "∞"}`;
  }

  if (appState.algorithmId === "kahn") {
    const inDegree = appState.graphNodeValues[nodeId];
    return Number.isFinite(inDegree) ? `in=${inDegree}` : "";
  }

  const orderIndex = appState.graphOrder.indexOf(nodeId);
  return orderIndex >= 0 ? `#${orderIndex + 1}` : "";
}

function renderGraph() {
  const svgNamespace = "http://www.w3.org/2000/svg";
  const edgesGroup = getElement("graphEdges");
  const nodesGroup = getElement("graphNodes");

  edgesGroup.innerHTML = "";
  nodesGroup.innerHTML = "";

  appState.graphEdges.forEach((edge) => {
    const edgeId = `${edge.from}-${edge.to}`;
    const coordinates = getEdgeCoordinates(edge);
    const line = document.createElementNS(svgNamespace, "line");
    const weight = document.createElementNS(svgNamespace, "text");

    line.setAttribute("x1", coordinates.x1);
    line.setAttribute("y1", coordinates.y1);
    line.setAttribute("x2", coordinates.x2);
    line.setAttribute("y2", coordinates.y2);
    line.setAttribute("marker-end", "url(#arrowHead)");
    line.classList.add("graph-edge");

    if (appState.graphRelaxedEdges.includes(edgeId)) {
      line.classList.add("relaxed");
    }
    if (appState.graphActiveEdge === edgeId) {
      line.classList.add("active");
    }

    weight.setAttribute("x", coordinates.labelX);
    weight.setAttribute("y", coordinates.labelY);
    weight.setAttribute("class", "graph-edge-label");
    weight.setAttribute("text-anchor", "middle");
    weight.textContent = edge.weight;

    edgesGroup.append(line, weight);
  });

  GRAPH_NODES.forEach((node) => {
    const group = document.createElementNS(svgNamespace, "g");
    const circle = document.createElementNS(svgNamespace, "circle");
    const label = document.createElementNS(svgNamespace, "text");
    const caption = document.createElementNS(svgNamespace, "text");

    group.classList.add("graph-node");
    group.setAttribute("data-node", node.id);

    if (appState.graphFrontier.includes(node.id)) {
      group.classList.add("frontier");
    }
    if (appState.graphVisited.includes(node.id)) {
      group.classList.add("visited");
    }
    if (appState.graphActiveNode === node.id) {
      group.classList.add("active");
    }

    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", 23);

    label.setAttribute("x", node.x);
    label.setAttribute("y", node.y);
    label.setAttribute("class", "node-label");
    label.textContent = node.id;

    caption.setAttribute("x", node.x);
    caption.setAttribute("y", node.y + 37);
    caption.setAttribute("class", "node-distance");
    caption.textContent = getGraphNodeCaption(node.id);

    group.append(circle, label, caption);
    nodesGroup.appendChild(group);
  });

  renderGraphResults();
}

function renderGraphResults() {
  const orderContainer = getElement("visitOrder");

  if (appState.graphOrder.length === 0) {
    orderContainer.innerHTML =
      '<span class="order-empty">Waiting for the first node</span>';
  } else {
    orderContainer.innerHTML = appState.graphOrder
      .map((nodeId) => `<span class="order-chip">${nodeId}</span>`)
      .join("");
  }

  const distanceSummary = getElement("distanceSummary");
  const shouldShowDistances = appState.algorithmId === "dijkstra";
  distanceSummary.classList.toggle("hidden", !shouldShowDistances);

  if (shouldShowDistances) {
    distanceSummary.textContent = GRAPH_NODES.map((node) => {
      const distance = appState.graphNodeValues[node.id];
      return `${node.id}: ${Number.isFinite(distance) ? distance : "∞"}`;
    }).join("  ·  ");
  }
}

function renderMiniArray() {
  const arrayPreview = getElement("arrayInput");
  const largestValue = Math.max(...appState.originalValues, 100);
  arrayPreview.innerHTML = "";

  appState.originalValues.forEach((value) => {
    const bar = document.createElement("i");
    bar.className = "mini-bar";
    bar.style.height = `${(value / largestValue) * 60}px`;
    arrayPreview.appendChild(bar);
  });

  getElement("arraySize").textContent = appState.originalValues.length;
}

function renderStats() {
  const progressPercentage = appState.totalSteps
    ? Math.round((appState.currentStep / appState.totalSteps) * 100)
    : 0;

  getElement("stepNumber").textContent = appState.currentStep;
  getElement("stepTotal").textContent = appState.totalSteps;
  getElement("graphStepNumber").textContent = appState.currentStep;
  getElement("graphStepTotal").textContent = appState.totalSteps;

  if (isGraphAlgorithm()) {
    getElement("firstMetricLabel").textContent = "Nodes processed";
    getElement("secondMetricLabel").textContent = "Edges checked";
    getElement("thirdMetricLabel").textContent = "Frontier size";
    getElement("comparisons").textContent = appState.graphVisited.length;
    getElement("swaps").textContent = appState.graphEdgesChecked;
    getElement("accesses").textContent = appState.graphFrontier.length;
  } else {
    getElement("firstMetricLabel").textContent = "Comparisons";
    getElement("secondMetricLabel").textContent = "Swaps";
    getElement("thirdMetricLabel").textContent = "Array access";
    getElement("comparisons").textContent = appState.comparisons;
    getElement("swaps").textContent = appState.swaps;
    getElement("accesses").textContent = appState.arrayAccesses;
  }

  getElement("progressLabel").textContent = `${progressPercentage}%`;
  getElement("runProgress").style.width = `${progressPercentage}%`;
  getElement("scrubber").value = appState.currentStep;
  getElement("scrubber").max = Math.max(appState.totalSteps, 1);
  getElement("scrubberFill").style.width = `${progressPercentage}%`;
}

function getEventStyle(type) {
  if (type === "compare" || type === "inspect-edge") {
    return "compare";
  }
  if (type === "swap" || type === "relax") {
    return "swap";
  }
  return "sort";
}

function addEventToStream(traceItem) {
  const eventList = getElement("eventList");

  if (appState.events.length === 1) {
    eventList.innerHTML = "";
  }

  const eventRow = document.createElement("div");
  const eventNumber = String(appState.events.length).padStart(2, "0");
  const eventMessage = traceItem.message || "Operation complete";

  eventRow.className = "event-row";
  eventRow.innerHTML = `
    <i class="event-dot ${getEventStyle(traceItem.type)}"></i>
    <time>${eventNumber}</time>
    <b>${eventMessage}</b>
  `;

  eventList.prepend(eventRow);
  getElement("eventCount").textContent = `${appState.events.length} events`;
}

function getHighlightsForStep(traceItem) {
  switch (traceItem.type) {
    case "compare":
      return { comparing: traceItem.indices };
    case "swap":
      return { swapping: traceItem.indices };
    case "done":
      return { sorted: traceItem.indices };
    case "visit":
    case "found":
      return { visited: traceItem.indices };
    default:
      return {};
  }
}

function getOperationTitle(traceItem) {
  if (traceItem.graph && traceItem.type === "done") {
    return "Graph run complete";
  }
  if (traceItem.type === "found") {
    return "Target found";
  }
  if (traceItem.type === "done") {
    return "Sorted successfully";
  }
  return traceItem.message;
}

function getOperationDetail(traceItem) {
  if (traceItem.graph) {
    const graphDetails = {
      queue:
        "The frontier contains nodes that are discovered but not processed.",
      visit: "This node is now part of the algorithm's output order.",
      "inspect-edge": "The highlighted directed edge is being examined.",
      relax: "A shorter route was found, so the tentative distance changed.",
      finish: "All descendants are complete, so the algorithm backtracks.",
      done: "The final node order and graph state are now visible.",
    };

    return graphDetails[traceItem.type] || "The graph state has advanced.";
  }

  if (traceItem.type === "compare") {
    return "A comparison is in progress.";
  }
  if (traceItem.type === "swap") {
    return "Values are moving into place.";
  }
  return "Keep going, you are building intuition.";
}

// -----------------------------------------------------------------------------
// Simulation controls
// -----------------------------------------------------------------------------

function applyGraphTraceItem(traceItem) {
  appState.graphVisited = [...traceItem.visited];
  appState.graphFrontier = [...traceItem.frontier];
  appState.graphOrder = [...traceItem.order];
  appState.graphActiveNode = traceItem.activeNode;
  appState.graphActiveEdge = traceItem.activeEdge;
  appState.graphRelaxedEdges = [...traceItem.relaxedEdges];
  appState.graphNodeValues = { ...traceItem.nodeValues };
  appState.graphEdgesChecked = traceItem.edgesChecked;

  renderGraph();
}

function applyTraceStep(stepIndex) {
  const traceItem = appState.trace[stepIndex];

  if (!traceItem) {
    return;
  }

  if (traceItem.graph) {
    applyGraphTraceItem(traceItem);
  } else {
    if (traceItem.type === "reset") {
      appState.values = [...traceItem.values];
    }

    if (traceItem.type === "swap") {
      const [firstIndex, secondIndex] = traceItem.indices;
      [appState.values[firstIndex], appState.values[secondIndex]] = [
        appState.values[secondIndex],
        appState.values[firstIndex],
      ];
      appState.swaps += 1;
    }

    if (traceItem.type === "compare") {
      appState.comparisons += 1;
    }

    appState.arrayAccesses += traceItem.indices?.length || 0;
    renderBars(getHighlightsForStep(traceItem));
  }

  appState.currentStep = stepIndex + 1;
  appState.events.push(traceItem);

  addEventToStream(traceItem);
  renderStats();

  getElement("operationTitle").textContent = getOperationTitle(traceItem);
  getElement("operationDetail").textContent = getOperationDetail(traceItem);
}

function stopPlayback() {
  clearInterval(appState.playbackTimer);
  appState.playbackTimer = null;
  appState.isPlaying = false;
  getElement("playIcon").textContent = "▶";
}

function resetSimulation() {
  stopPlayback();

  appState.values = [...appState.originalValues];
  appState.trace = createAlgorithmTrace(appState.values, appState.algorithmId);
  appState.totalSteps = appState.trace.length;
  appState.currentStep = 0;
  appState.events = [];
  appState.comparisons = 0;
  appState.swaps = 0;
  appState.arrayAccesses = 0;
  appState.graphVisited = [];
  appState.graphFrontier = [];
  appState.graphOrder = [];
  appState.graphActiveNode = null;
  appState.graphActiveEdge = null;
  appState.graphRelaxedEdges = [];
  appState.graphNodeValues = {};
  appState.graphEdgesChecked = 0;

  getElement("eventList").innerHTML = `
    <div class="empty-events">
      <span>◌</span>
      <p>Start the simulation to see<br>each operation appear here.</p>
    </div>
  `;
  getElement("eventCount").textContent = "0 events";
  getElement("operationTitle").textContent = "Ready to begin";
  getElement("operationDetail").textContent =
    "Press play or step through the algorithm.";

  if (isGraphAlgorithm()) {
    renderGraph();
  } else {
    renderBars();
  }
  renderStats();
}

function playNextStep() {
  if (appState.currentStep >= appState.totalSteps) {
    stopPlayback();
    return;
  }
  applyTraceStep(appState.currentStep);
}

function togglePlayback() {
  if (appState.isPlaying) {
    stopPlayback();
    return;
  }

  if (appState.currentStep >= appState.totalSteps) {
    resetSimulation();
  }

  appState.isPlaying = true;
  getElement("playIcon").textContent = "Ⅱ";

  const playbackDelay = Number(getElement("speedSelect").value);
  appState.playbackTimer = setInterval(playNextStep, playbackDelay);
}

function stepForward() {
  if (appState.currentStep >= appState.totalSteps) {
    resetSimulation();
  }
  applyTraceStep(appState.currentStep);
}

function seekToStep(stepNumber) {
  resetSimulation();
  for (let stepIndex = 0; stepIndex < stepNumber; stepIndex += 1) {
    applyTraceStep(stepIndex);
  }
}

function restartPlaybackAtNewSpeed() {
  if (!appState.isPlaying) {
    return;
  }
  stopPlayback();
  togglePlayback();
}

// -----------------------------------------------------------------------------
// Algorithm, category, and page navigation
// -----------------------------------------------------------------------------

function renderPseudocode(algorithm) {
  const defaultSteps = [
    `${algorithm.name} explores the data`,
    "compare the current candidates",
    "update the active state",
    "repeat until complete",
  ];
  const steps = algorithm.pseudocode || defaultSteps;

  getElement("codeBlock").innerHTML = steps
    .map((step, index) => {
      const lineNumber = String(index + 1).padStart(2, "0");
      const activeClass = index === 2 ? ' class="code-active"' : "";
      return `<div${activeClass}><span class="line-no">${lineNumber}</span>${step}</div>`;
    })
    .join("");
}

function updateVisualizationMode() {
  const graphMode = isGraphAlgorithm();

  getElement("arrayVisualization").classList.toggle("hidden", graphMode);
  getElement("arrayLegend").classList.toggle("hidden", graphMode);
  getElement("graphVisualization").classList.toggle("hidden", !graphMode);
  getElement("graphLegend").classList.toggle("hidden", !graphMode);
  getElement("graphResults").classList.toggle("hidden", !graphMode);
  getElement("arrayInput").classList.toggle("hidden", graphMode);
  getElement("graphDataSummary").classList.toggle("hidden", !graphMode);
  getElement("editDataButton").classList.toggle("hidden", graphMode);
  getElement("dataEditor").classList.add("hidden");

  getElement("dataPanelLabel").textContent = graphMode
    ? "GRAPH MODEL"
    : "INPUT DATA";
  getElement("dataPanelTitle").textContent = graphMode
    ? "Directed weighted graph"
    : "Array configuration";
  getElement("arraySize").textContent = graphMode
    ? GRAPH_NODES.length
    : appState.originalValues.length;
  getElement("dataUnit").textContent = graphMode ? " nodes" : " elements";
  getElement("dataStatus").textContent = graphMode
    ? "DAG preset"
    : "Randomized";
  getElement("randomizeButton").querySelector("span").textContent = graphMode
    ? "New weights"
    : "Randomize";

  const categoryName = graphMode ? "GRAPHS" : appState.category.toUpperCase();
  getElement("pageOverline").innerHTML =
    `INTERACTIVE LAB <span>•</span> ${categoryName}`;
}

function updateSelectedAlgorithm() {
  const algorithmSelect = getElement("algorithmSelect");
  const selectedAlgorithmId = algorithmSelect.value;
  const algorithm = algorithms[selectedAlgorithmId];

  appState.algorithmId = selectedAlgorithmId;
  appState.category = algorithm.category;

  getElement("algorithmTitle").textContent = algorithm.name;
  getElement("timeComplexity").textContent = algorithm.time;
  getElement("spaceComplexity").textContent = algorithm.space;
  getElement("learningCue").textContent = algorithm.cue;

  updateVisualizationMode();
  renderPseudocode(algorithm);
  resetSimulation();
}

function selectCategory(category) {
  appState.category = category;

  document.querySelectorAll("#categoryTabs button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.category === category);
  });

  const algorithmSelect = getElement("algorithmSelect");
  const options = [...algorithmSelect.options];

  options.forEach((option) => {
    option.hidden = option.dataset.category !== category;
  });

  const firstMatchingOption = options.find(
    (option) => option.dataset.category === category,
  );

  if (!firstMatchingOption) {
    return;
  }

  algorithmSelect.value = firstMatchingOption.value;
  updateSelectedAlgorithm();
}

function getViewContent(view) {
  if (view === "library") {
    return {
      breadcrumb: "Algorithm library",
      overline: "LIBRARY",
      title: "A map for <em>curious minds.</em>",
      subtitle: "Pick a topic and jump straight into an interactive run.",
    };
  }

  if (view === "notes") {
    return {
      breadcrumb: "My notes",
      overline: "NOTES",
      title: "Keep your <em>aha moments.</em>",
      subtitle: "Save the details you want to remember from each experiment.",
    };
  }

  return {
    breadcrumb: "Visualizer",
    overline: `INTERACTIVE LAB <span>•</span> ${appState.category.toUpperCase()}`,
    title: "Make algorithms <em>visible.</em>",
    subtitle:
      "Build intuition by watching every comparison, swap, and decision unfold.",
  };
}

function showView(view) {
  getElement("workspaceView").classList.toggle("hidden", view !== "workspace");
  getElement("libraryView").classList.toggle("hidden", view !== "library");
  getElement("notesView").classList.toggle("hidden", view !== "notes");

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  const content = getViewContent(view);
  getElement("breadcrumbTitle").textContent = content.breadcrumb;
  getElement("pageOverline").innerHTML = content.overline;
  getElement("pageTitle").innerHTML = content.title;
  getElement("pageSubtitle").textContent = content.subtitle;
}

function openAlgorithmFromLibrary(algorithmId) {
  const algorithm = algorithms[algorithmId];
  selectCategory(algorithm.category);
  getElement("algorithmSelect").value = algorithmId;
  updateSelectedAlgorithm();
  showView("workspace");
}

function buildAlgorithmLibrary() {
  const libraryCards = Object.entries(algorithms).map(
    ([algorithmId, algorithm]) => `
    <button class="library-card" data-algorithm="${algorithmId}">
      <span class="library-type">${algorithm.category}</span>
      <strong>${algorithm.name}</strong>
      <small>${algorithm.time} · ${algorithm.space}</small>
      <span class="library-arrow">→</span>
    </button>
  `,
  );

  getElement("libraryGrid").innerHTML = libraryCards.join("");

  document.querySelectorAll(".library-card").forEach((card) => {
    card.addEventListener("click", () => {
      openAlgorithmFromLibrary(card.dataset.algorithm);
    });
  });
}

function selectInspectorPanel(selectedButton) {
  document.querySelectorAll(".inspector-tabs button").forEach((button) => {
    button.classList.remove("active");
  });

  selectedButton.classList.add("active");
  const selectedPanel = selectedButton.dataset.panel;
  getElement("insightsPanel").classList.toggle(
    "hidden",
    selectedPanel !== "insights",
  );
  getElement("codePanel").classList.toggle("hidden", selectedPanel !== "code");
}

// -----------------------------------------------------------------------------
// Data, notes, and sharing
// -----------------------------------------------------------------------------

function randomizeData() {
  if (isGraphAlgorithm()) {
    appState.graphEdges = DEFAULT_GRAPH_EDGES.map((edge) => ({
      ...edge,
      weight: Math.floor(Math.random() * 9) + 1,
    }));
    getElement("dataStatus").textContent = "New weights";
    resetSimulation();
    return;
  }

  const requestedSize = Number(getElement("sizeInput").value);
  appState.originalValues = createRandomArray(requestedSize);
  getElement("dataStatus").textContent = "Randomized";
  renderMiniArray();
  resetSimulation();
}

function parseManualValues(input) {
  return input
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 100);
}

function getRequestedArraySize() {
  const requestedSize =
    Number(getElement("sizeInput").value) || DEFAULT_ARRAY_SIZE;
  return Math.min(MAX_ARRAY_SIZE, Math.max(MIN_ARRAY_SIZE, requestedSize));
}

function applyDataChanges() {
  const manualValues = parseManualValues(getElement("manualInput").value);
  const hasEnoughManualValues = manualValues.length >= MIN_ARRAY_SIZE;

  appState.originalValues = hasEnoughManualValues
    ? manualValues.slice(0, MAX_ARRAY_SIZE)
    : createRandomArray(getRequestedArraySize());

  getElement("sizeInput").value = appState.originalValues.length;
  getElement("dataStatus").textContent = hasEnoughManualValues
    ? "Manual input"
    : "Randomized";

  renderMiniArray();
  resetSimulation();
  getElement("dataEditor").classList.add("hidden");
}

function saveNote() {
  const note = getElement("notesEditor").value.trim();
  getElement("savedNote").textContent = note
    ? `Saved just now: ${note}`
    : "Write a note before saving.";
}

function shareCurrentRun() {
  navigator.clipboard?.writeText(window.location.href);
  const toast = getElement("toast");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

// -----------------------------------------------------------------------------
// Event listeners and application startup
// -----------------------------------------------------------------------------

function registerEventListeners() {
  getElement("playButton").addEventListener("click", togglePlayback);
  getElement("stepButton").addEventListener("click", stepForward);
  getElement("resetButton").addEventListener("click", resetSimulation);
  getElement("randomizeButton").addEventListener("click", randomizeData);
  getElement("algorithmSelect").addEventListener(
    "change",
    updateSelectedAlgorithm,
  );
  getElement("speedSelect").addEventListener(
    "change",
    restartPlaybackAtNewSpeed,
  );
  getElement("shareButton").addEventListener("click", shareCurrentRun);

  getElement("scrubber").addEventListener("input", (event) => {
    seekToStep(Number(event.target.value));
  });

  document.querySelectorAll("#categoryTabs button").forEach((button) => {
    button.addEventListener("click", () =>
      selectCategory(button.dataset.category),
    );
  });

  document.querySelectorAll(".inspector-tabs button").forEach((button) => {
    button.addEventListener("click", () => selectInspectorPanel(button));
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  getElement("editDataButton").addEventListener("click", () => {
    getElement("dataEditor").classList.toggle("hidden");
  });

  getElement("closeDataButton").addEventListener("click", () => {
    getElement("dataEditor").classList.add("hidden");
  });

  getElement("applyDataButton").addEventListener("click", applyDataChanges);
  getElement("saveNoteButton").addEventListener("click", saveNote);
}

function initializeApplication() {
  appState.originalValues = createRandomArray();
  buildAlgorithmLibrary();
  registerEventListeners();
  selectCategory("sorting");
  renderMiniArray();
}

initializeApplication();
