import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET, require_POST


def dashboard(request):
    return render(request, 'visualizer/dashboard.html')


@require_GET
def algorithm(request, algorithm):
    catalog = {
        'bubble-sort': {'name': 'Bubble Sort', 'complexity': 'O(n^2)', 'space': 'O(1)', 'category': 'Sorting'},
        'selection-sort': {'name': 'Selection Sort', 'complexity': 'O(n^2)', 'space': 'O(1)', 'category': 'Sorting'},
        'binary-search': {'name': 'Binary Search', 'complexity': 'O(log n)', 'space': 'O(1)', 'category': 'Searching'},
    }
    item = catalog.get(algorithm)
    if not item:
        return JsonResponse({'error': 'Unknown algorithm'}, status=404)
    return JsonResponse({'algorithm': algorithm, **item})
