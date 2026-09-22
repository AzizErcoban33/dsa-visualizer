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
  'bubble-sort': {
    name: 'Bubble Sort',
    category: 'sorting',
    time: 'O(n²)',
    space: 'O(1)',
    cue: 'Repeatedly move the largest unsorted value to the end.',
  },
  'selection-sort': {
    name: 'Selection Sort',
    category: 'sorting',
    time: 'O(n²)',
    space: 'O(1)',
    cue: 'Grow a sorted region by selecting the next minimum.',
  },
  'insertion-sort': {
    name: 'Insertion Sort',
    category: 'sorting',
    time: 'O(n²)',
    space: 'O(1)',
    cue: 'Insert each new value into the sorted portion on the left.',
  },
  'quick-sort': {
    name: 'Quick Sort',
    category: 'sorting',
    time: 'O(n log n)',
    space: 'O(log n)',
    cue: 'Partition around a pivot, then solve each smaller region.',
  },
  'merge-sort': {
    name: 'Merge Sort',
    category: 'sorting',
    time: 'O(n log n)',
    space: 'O(n)',
    cue: 'Split the array, sort both halves, then merge them.',
  },
  'linear-search': {
    name: 'Linear Search',
    category: 'searching',
    time: 'O(n)',
    space: 'O(1)',
    cue: 'Check each value from left to right until the target appears.',
  },
  'binary-search': {
    name: 'Binary Search',
    category: 'searching',
    time: 'O(log n)',
    space: 'O(1)',
    cue: 'Halve the remaining search space after every comparison.',
  },
  bfs: {
    name: 'Breadth-first Search',
    category: 'graphs',
    time: 'O(V + E)',
    space: 'O(V)',
    cue: 'Explore the graph layer by layer using a queue.',
  },
  dfs: {
    name: 'Depth-first Search',
    category: 'graphs',
    time: 'O(V + E)',
    space: 'O(V)',
    cue: 'Follow one path deeply before backtracking.',
  },
};

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
  algorithmId: 'bubble-sort',
  category: 'sorting',
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
    type: 'compare',
    indices: [firstIndex, secondIndex],
    message: `Comparing ${values[firstIndex]} and ${values[secondIndex]}`,
  };
}

function createCompletedStep(values) {
  return {
    type: 'done',
    indices: values.map((_, index) => index),
    message: 'Array sorted. Nice work.',
  };
}

function createBubbleSortTrace(values) {
  const workingValues = [...values];
  const trace = [];

  for (let unsortedEnd = workingValues.length - 1; unsortedEnd > 0; unsortedEnd -= 1) {
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
        type: 'swap',
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

  for (let currentIndex = 0; currentIndex < workingValues.length - 1; currentIndex += 1) {
    let minimumIndex = currentIndex;

    for (let candidateIndex = currentIndex + 1; candidateIndex < workingValues.length; candidateIndex += 1) {
      trace.push(createCompareStep(workingValues, minimumIndex, candidateIndex));

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
      type: 'swap',
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

  for (let currentIndex = 1; currentIndex < workingValues.length; currentIndex += 1) {
    let insertionIndex = currentIndex;

    while (insertionIndex > 0) {
      const previousIndex = insertionIndex - 1;
      trace.push(createCompareStep(workingValues, previousIndex, insertionIndex));

      if (workingValues[previousIndex] <= workingValues[insertionIndex]) {
        break;
      }

      [workingValues[previousIndex], workingValues[insertionIndex]] = [
        workingValues[insertionIndex],
        workingValues[previousIndex],
      ];

      trace.push({
        type: 'swap',
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
    trace.push({ type: 'compare', indices: [index], message: `Checking ${value}` });

    if (value === targetValue) {
      trace.push({
        type: 'found',
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
  const trace = [{ type: 'reset', values: sortedValues, indices: [] }];

  let lowIndex = 0;
  let highIndex = sortedValues.length - 1;

  while (lowIndex <= highIndex) {
    const middleIndex = Math.floor((lowIndex + highIndex) / 2);
    const middleValue = sortedValues[middleIndex];

    trace.push({
      type: 'compare',
      indices: [lowIndex, highIndex, middleIndex],
      message: `Checking midpoint ${middleValue}`,
    });

    if (middleValue === targetValue) {
      trace.push({
        type: 'found',
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

function createGraphTrace(algorithmId) {
  const breadthFirstOrder = [0, 1, 2, 3, 4, 5, 6, 7];
  const depthFirstOrder = [0, 1, 3, 5, 7, 6, 4, 2];
  const isBreadthFirst = algorithmId === 'bfs';
  const traversalOrder = isBreadthFirst ? breadthFirstOrder : depthFirstOrder;

  return traversalOrder.map((nodeIndex, stepIndex) => ({
    type: stepIndex === 0 ? 'compare' : 'visit',
    indices: [nodeIndex],
    message: `${isBreadthFirst ? 'Visited graph layer' : 'Explored path'} at node ${nodeIndex + 1}`,
  }));
}

function createAlgorithmTrace(values, algorithmId) {
  switch (algorithmId) {
    case 'bubble-sort':
      return createBubbleSortTrace(values);
    case 'selection-sort':
      return createSelectionSortTrace(values);
    case 'insertion-sort':
      return createInsertionSortTrace(values);
    case 'quick-sort':
    case 'merge-sort':
      // These visual demos currently reuse the adjacent-comparison animation.
      return createBubbleSortTrace(values);
    case 'linear-search':
      return createLinearSearchTrace(values);
    case 'binary-search':
      return createBinarySearchTrace(values);
    case 'bfs':
    case 'dfs':
      return createGraphTrace(algorithmId);
    default:
      return [];
  }
}

// -----------------------------------------------------------------------------
// Rendering
// -----------------------------------------------------------------------------

function renderBars(highlights = {}) {
  const barsContainer = getElement('bars');
  const largestValue = Math.max(...appState.values, 100);
  barsContainer.innerHTML = '';

  appState.values.forEach((value, index) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${Math.max(6, (value / largestValue) * 100)}%`;

    if (highlights.comparing?.includes(index)) {
      bar.classList.add('comparing');
    }
    if (highlights.swapping?.includes(index)) {
      bar.classList.add('swapping');
    }
    if (highlights.sorted?.includes(index) || highlights.visited?.includes(index)) {
      bar.classList.add('sorted');
    }

    barsContainer.appendChild(bar);
  });
}

function renderMiniArray() {
  const arrayPreview = getElement('arrayInput');
  const largestValue = Math.max(...appState.originalValues, 100);
  arrayPreview.innerHTML = '';

  appState.originalValues.forEach((value) => {
    const bar = document.createElement('i');
    bar.className = 'mini-bar';
    bar.style.height = `${(value / largestValue) * 60}px`;
    arrayPreview.appendChild(bar);
  });

  getElement('arraySize').textContent = appState.originalValues.length;
}

function renderStats() {
  const progressPercentage = appState.totalSteps
    ? Math.round((appState.currentStep / appState.totalSteps) * 100)
    : 0;

  getElement('stepNumber').textContent = appState.currentStep;
  getElement('stepTotal').textContent = appState.totalSteps;
  getElement('comparisons').textContent = appState.comparisons;
  getElement('swaps').textContent = appState.swaps;
  getElement('accesses').textContent = appState.arrayAccesses;
  getElement('progressLabel').textContent = `${progressPercentage}%`;
  getElement('runProgress').style.width = `${progressPercentage}%`;
  getElement('scrubber').value = appState.currentStep;
  getElement('scrubber').max = Math.max(appState.totalSteps, 1);
  getElement('scrubberFill').style.width = `${progressPercentage}%`;
}

function getEventStyle(type) {
  if (type === 'compare') {
    return 'compare';
  }
  if (type === 'swap') {
    return 'swap';
  }
  return 'sort';
}

function addEventToStream(traceItem) {
  const eventList = getElement('eventList');

  if (appState.events.length === 1) {
    eventList.innerHTML = '';
  }

  const eventRow = document.createElement('div');
  const eventNumber = String(appState.events.length).padStart(2, '0');
  const eventMessage = traceItem.message || 'Operation complete';

  eventRow.className = 'event-row';
  eventRow.innerHTML = `
    <i class="event-dot ${getEventStyle(traceItem.type)}"></i>
    <time>${eventNumber}</time>
    <b>${eventMessage}</b>
  `;

  eventList.prepend(eventRow);
  getElement('eventCount').textContent = `${appState.events.length} events`;
}

function getHighlightsForStep(traceItem) {
  switch (traceItem.type) {
    case 'compare':
      return { comparing: traceItem.indices };
    case 'swap':
      return { swapping: traceItem.indices };
    case 'done':
      return { sorted: traceItem.indices };
    case 'visit':
    case 'found':
      return { visited: traceItem.indices };
    default:
      return {};
  }
}

function getOperationTitle(traceItem) {
  if (traceItem.type === 'found') {
    return 'Target found';
  }
  if (traceItem.type === 'done') {
    return 'Sorted successfully';
  }
  return traceItem.message;
}

function getOperationDetail(type) {
  if (type === 'compare') {
    return 'A comparison is in progress.';
  }
  if (type === 'swap') {
    return 'Values are moving into place.';
  }
  return 'Keep going, you are building intuition.';
}

// -----------------------------------------------------------------------------
// Simulation controls
// -----------------------------------------------------------------------------

function applyTraceStep(stepIndex) {
  const traceItem = appState.trace[stepIndex];

  if (!traceItem) {
    return;
  }

  if (traceItem.type === 'reset') {
    appState.values = [...traceItem.values];
  }

  if (traceItem.type === 'swap') {
    const [firstIndex, secondIndex] = traceItem.indices;
    [appState.values[firstIndex], appState.values[secondIndex]] = [
      appState.values[secondIndex],
      appState.values[firstIndex],
    ];
    appState.swaps += 1;
  }

  if (traceItem.type === 'compare') {
    appState.comparisons += 1;
  }

  appState.arrayAccesses += traceItem.indices?.length || 0;
  appState.currentStep = stepIndex + 1;
  appState.events.push(traceItem);

  addEventToStream(traceItem);
  renderBars(getHighlightsForStep(traceItem));
  renderStats();

  getElement('operationTitle').textContent = getOperationTitle(traceItem);
  getElement('operationDetail').textContent = getOperationDetail(traceItem.type);
}

function stopPlayback() {
  clearInterval(appState.playbackTimer);
  appState.playbackTimer = null;
  appState.isPlaying = false;
  getElement('playIcon').textContent = '▶';
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

  getElement('eventList').innerHTML = `
    <div class="empty-events">
      <span>◌</span>
      <p>Start the simulation to see<br>each operation appear here.</p>
    </div>
  `;
  getElement('eventCount').textContent = '0 events';
  getElement('operationTitle').textContent = 'Ready to begin';
  getElement('operationDetail').textContent = 'Press play or step through the algorithm.';

  renderBars();
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
  getElement('playIcon').textContent = 'Ⅱ';

  const playbackDelay = Number(getElement('speedSelect').value);
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

function renderPseudocode(algorithmName) {
  getElement('codeBlock').innerHTML = `
    <div><span class="line-no">01</span><span class="keyword">${algorithmName}</span> explores the data</div>
    <div><span class="line-no">02</span>compare the current candidates</div>
    <div class="code-active"><span class="line-no">03</span>update the active state</div>
    <div><span class="line-no">04</span>repeat until complete</div>
  `;
}

function updateSelectedAlgorithm() {
  const algorithmSelect = getElement('algorithmSelect');
  const selectedAlgorithmId = algorithmSelect.value;
  const algorithm = algorithms[selectedAlgorithmId];

  appState.algorithmId = selectedAlgorithmId;
  appState.category = algorithm.category;

  getElement('algorithmTitle').textContent = algorithm.name;
  getElement('timeComplexity').textContent = algorithm.time;
  getElement('spaceComplexity').textContent = algorithm.space;
  getElement('learningCue').textContent = algorithm.cue;

  renderPseudocode(algorithm.name);
  resetSimulation();
}

function selectCategory(category) {
  appState.category = category;

  document.querySelectorAll('#categoryTabs button').forEach((button) => {
    button.classList.toggle('selected', button.dataset.category === category);
  });

  const algorithmSelect = getElement('algorithmSelect');
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
  if (view === 'library') {
    return {
      breadcrumb: 'Algorithm library',
      overline: 'LIBRARY',
      title: 'A map for <em>curious minds.</em>',
      subtitle: 'Pick a topic and jump straight into an interactive run.',
    };
  }

  if (view === 'notes') {
    return {
      breadcrumb: 'My notes',
      overline: 'NOTES',
      title: 'Keep your <em>aha moments.</em>',
      subtitle: 'Save the details you want to remember from each experiment.',
    };
  }

  return {
    breadcrumb: 'Visualizer',
    overline: 'INTERACTIVE LAB <span>•</span> SORTING',
    title: 'Make algorithms <em>visible.</em>',
    subtitle: 'Build intuition by watching every comparison, swap, and decision unfold.',
  };
}

function showView(view) {
  getElement('workspaceView').classList.toggle('hidden', view !== 'workspace');
  getElement('libraryView').classList.toggle('hidden', view !== 'library');
  getElement('notesView').classList.toggle('hidden', view !== 'notes');

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  const content = getViewContent(view);
  getElement('breadcrumbTitle').textContent = content.breadcrumb;
  getElement('pageOverline').innerHTML = content.overline;
  getElement('pageTitle').innerHTML = content.title;
  getElement('pageSubtitle').textContent = content.subtitle;
}

function openAlgorithmFromLibrary(algorithmId) {
  const algorithm = algorithms[algorithmId];
  selectCategory(algorithm.category);
  getElement('algorithmSelect').value = algorithmId;
  updateSelectedAlgorithm();
  showView('workspace');
}

function buildAlgorithmLibrary() {
  const libraryCards = Object.entries(algorithms).map(([algorithmId, algorithm]) => `
    <button class="library-card" data-algorithm="${algorithmId}">
      <span class="library-type">${algorithm.category}</span>
      <strong>${algorithm.name}</strong>
      <small>${algorithm.time} · ${algorithm.space}</small>
      <span class="library-arrow">→</span>
    </button>
  `);

  getElement('libraryGrid').innerHTML = libraryCards.join('');

  document.querySelectorAll('.library-card').forEach((card) => {
    card.addEventListener('click', () => {
      openAlgorithmFromLibrary(card.dataset.algorithm);
    });
  });
}

function selectInspectorPanel(selectedButton) {
  document.querySelectorAll('.inspector-tabs button').forEach((button) => {
    button.classList.remove('active');
  });

  selectedButton.classList.add('active');
  const selectedPanel = selectedButton.dataset.panel;
  getElement('insightsPanel').classList.toggle('hidden', selectedPanel !== 'insights');
  getElement('codePanel').classList.toggle('hidden', selectedPanel !== 'code');
}

// -----------------------------------------------------------------------------
// Data, notes, and sharing
// -----------------------------------------------------------------------------

function randomizeData() {
  const requestedSize = Number(getElement('sizeInput').value);
  appState.originalValues = createRandomArray(requestedSize);
  getElement('dataStatus').textContent = 'Randomized';
  renderMiniArray();
  resetSimulation();
}

function parseManualValues(input) {
  return input
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 100);
}

function getRequestedArraySize() {
  const requestedSize = Number(getElement('sizeInput').value) || DEFAULT_ARRAY_SIZE;
  return Math.min(MAX_ARRAY_SIZE, Math.max(MIN_ARRAY_SIZE, requestedSize));
}

function applyDataChanges() {
  const manualValues = parseManualValues(getElement('manualInput').value);
  const hasEnoughManualValues = manualValues.length >= MIN_ARRAY_SIZE;

  appState.originalValues = hasEnoughManualValues
    ? manualValues.slice(0, MAX_ARRAY_SIZE)
    : createRandomArray(getRequestedArraySize());

  getElement('sizeInput').value = appState.originalValues.length;
  getElement('dataStatus').textContent = hasEnoughManualValues
    ? 'Manual input'
    : 'Randomized';

  renderMiniArray();
  resetSimulation();
  getElement('dataEditor').classList.add('hidden');
}

function saveNote() {
  const note = getElement('notesEditor').value.trim();
  getElement('savedNote').textContent = note
    ? `Saved just now: ${note}`
    : 'Write a note before saving.';
}

function shareCurrentRun() {
  navigator.clipboard?.writeText(window.location.href);
  const toast = getElement('toast');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

// -----------------------------------------------------------------------------
// Event listeners and application startup
// -----------------------------------------------------------------------------

function registerEventListeners() {
  getElement('playButton').addEventListener('click', togglePlayback);
  getElement('stepButton').addEventListener('click', stepForward);
  getElement('resetButton').addEventListener('click', resetSimulation);
  getElement('randomizeButton').addEventListener('click', randomizeData);
  getElement('algorithmSelect').addEventListener('change', updateSelectedAlgorithm);
  getElement('speedSelect').addEventListener('change', restartPlaybackAtNewSpeed);
  getElement('shareButton').addEventListener('click', shareCurrentRun);

  getElement('scrubber').addEventListener('input', (event) => {
    seekToStep(Number(event.target.value));
  });

  document.querySelectorAll('#categoryTabs button').forEach((button) => {
    button.addEventListener('click', () => selectCategory(button.dataset.category));
  });

  document.querySelectorAll('.inspector-tabs button').forEach((button) => {
    button.addEventListener('click', () => selectInspectorPanel(button));
  });

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.view));
  });

  getElement('editDataButton').addEventListener('click', () => {
    getElement('dataEditor').classList.toggle('hidden');
  });

  getElement('closeDataButton').addEventListener('click', () => {
    getElement('dataEditor').classList.add('hidden');
  });

  getElement('applyDataButton').addEventListener('click', applyDataChanges);
  getElement('saveNoteButton').addEventListener('click', saveNote);
}

function initializeApplication() {
  appState.originalValues = createRandomArray();
  buildAlgorithmLibrary();
  registerEventListeners();
  selectCategory('sorting');
  renderMiniArray();
}

initializeApplication();
