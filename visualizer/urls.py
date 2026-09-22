from django.urls import path

from . import views


urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path(
        "api/algorithm/<str:algorithm>/",
        views.algorithm,
        name="algorithm",
    ),
]
