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
    "binary-search": {
        "name": "Binary Search",
        "complexity": "O(log n)",
        "space": "O(1)",
        "category": "Searching",
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
