from django.urls import path
from .views import VisionView, DescView,FeatureDetailView,FeatureView

urlpatterns = [
    path('<int:project_id>/vision/', VisionView.as_view(), name='project-vision'),
    path('<int:project_id>/desc/', DescView.as_view(), name='project-desc'),
    path('<int:project_id>/features/', FeatureView.as_view(), name='feature-suggestions'),
    path('<int:project_id>/features/<int:pk>/', FeatureDetailView.as_view(), name='feature-suggestion-detail'),
]