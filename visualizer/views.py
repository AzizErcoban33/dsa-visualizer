from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET


ALGORITHM_CATALOG = {
    "bubble-sort": {
        "name": "Bubble Sort",
        "complexity": "O(n^2)",
        "space": "O(1)",
        "category": "Sorting",
    },
    "selection-sort": {
        "name": "Selection Sort",
        "complexity": "O(n^2)",
        "space": "O(1)",
        "category": "Sorting",
    },
    "insertion-sort": {
        "name": "Insertion Sort",
        "complexity": "O(n^2)",
        "space": "O(1)",
        "category": "Sorting",
    },
    "quick-sort": {
        "name": "Quick Sort",
        "complexity": "O(n log n)",
        "space": "O(log n)",
        "category": "Sorting",
    },
    "merge-sort": {
        "name": "Merge Sort",
        "complexity": "O(n log n)",
        "space": "O(n)",
        "category": "Sorting",
    },
    "linear-search": {
        "name": "Linear Search",
        "complexity": "O(n)",
        "space": "O(1)",
        "category": "Searching",
    },
    "binary-search": {
        "name": "Binary Search",
        "complexity": "O(log n)",
        "space": "O(1)",
        "category": "Searching",
    },
    "bfs": {
        "name": "Breadth-first Search",
        "complexity": "O(V + E)",
        "space": "O(V)",
        "category": "Graphs",
    },
    "dfs": {
        "name": "Depth-first Search",
        "complexity": "O(V + E)",
        "space": "O(V)",
        "category": "Graphs",
    },
    "dijkstra": {
        "name": "Dijkstra's Shortest Path",
        "complexity": "O((V + E) log V)",
        "space": "O(V)",
        "category": "Graphs",
    },
    "topological-sort": {
        "name": "Topological Sort (DFS)",
        "complexity": "O(V + E)",
        "space": "O(V)",
        "category": "Graphs",
    },
    "kahn": {
        "name": "Kahn's Algorithm",
        "complexity": "O(V + E)",
        "space": "O(V)",
        "category": "Graphs",
    },
}


def dashboard(request):
    """Render the interactive algorithm visualizer."""
    return render(request, "visualizer/dashboard.html")


@require_GET
def algorithm(request, algorithm):
    """Return metadata for a supported algorithm."""
    algorithm_details = ALGORITHM_CATALOG.get(algorithm)

    if algorithm_details is None:
        return JsonResponse({"error": "Unknown algorithm"}, status=404)

    return JsonResponse(
        {
            "algorithm": algorithm,
            **algorithm_details,
        }
    )
