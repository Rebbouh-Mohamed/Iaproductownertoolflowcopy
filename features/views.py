from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from projects.models import Project
from .models import ProductVision, ProjectDesc,Feature,PreFeature
from .serializers import ProductVisionSerializer, ProjectDescSerializer,PreFeatureSerializer,FeatureSerializer
from rest_framework.exceptions import PermissionDenied

class VisionView(APIView):
    permission_classes = [IsAuthenticated]

    def get_project(self, project_id, user):
        # Secure: Only return if user owns the project
        return get_object_or_404(Project, id=project_id, owner=user)

    def get(self, request, project_id):
        project = self.get_project(project_id, request.user)
        vision, created = ProductVision.objects.get_or_create(project=project)
        serializer = ProductVisionSerializer(vision)
        return Response(serializer.data)

    def put(self, request, project_id):
        project = self.get_project(project_id, request.user)
        vision, created = ProductVision.objects.get_or_create(project=project)
        serializer = ProductVisionSerializer(vision, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DescView(APIView):
    permission_classes = [IsAuthenticated]

    def get_project(self, project_id, user):
        return get_object_or_404(Project, id=project_id, owner=user)

    def get(self, request, project_id):
        project = self.get_project(project_id, request.user)
        desc, created = ProjectDesc.objects.get_or_create(project=project)
        serializer = ProjectDescSerializer(desc)
        return Response(serializer.data)

    def put(self, request, project_id):
        project = self.get_project(project_id, request.user)
        desc, created = ProjectDesc.objects.get_or_create(project=project)
        serializer = ProjectDescSerializer(desc, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# In features/views.py

class FeatureView(APIView):
    permission_classes = [IsAuthenticated]

    def get_project(self, project_id, user):
        return get_object_or_404(Project, id=project_id, owner=user)

    def get(self, request, project_id):
        project = self.get_project(project_id, request.user)
        features = Feature.objects.filter(project=project)
        serializer = FeatureSerializer(features, many=True)
        return Response(serializer.data)

    def post(self, request, project_id):
        project = self.get_project(project_id, request.user)
        serializer = FeatureSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)  # Explicitly set project
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FeatureDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user, project_id):  # Added project_id for extra check if needed
        feature = get_object_or_404(Feature, pk=pk)
        if feature.project.id != int(project_id) or feature.project.owner != user:
            raise PermissionDenied("Not authorized")
        return feature

    def get(self, request, project_id, pk):
        feature = self.get_object(pk, request.user, project_id)
        serializer = FeatureSerializer(feature)
        return Response(serializer.data)

    def put(self, request, project_id, pk):
        feature = self.get_object(pk, request.user, project_id)
        serializer = FeatureSerializer(feature, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_id, pk):
        feature = self.get_object(pk, request.user, project_id)
        feature.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)