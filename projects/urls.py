from django.urls import path
from .views import ProjectListView, ProjectDetailView

from django.urls import path
from .views import ProjectListView, ProjectDetailView, ProjectTypeListView, ProjectTypeDetailView

urlpatterns = [
    path('', ProjectListView.as_view(), name='project-list'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('types/', ProjectTypeListView.as_view(), name='project-type-list'),
    path('types/<int:pk>/', ProjectTypeDetailView.as_view(), name='project-type-detail'),
]