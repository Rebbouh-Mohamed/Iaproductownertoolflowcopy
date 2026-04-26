from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Project,ProjectType
from .serializers import ProjectSerializer,ProjectTypeSerializer

class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'project_type']  # Filter by status/type
    search_fields = ['name', 'description']  # Search bar
    ordering_fields = ['created_at', 'start_date', 'end_date']  # Sorting

    def get(self, request):
        projects = Project.objects.filter(owner=request.user)
        
        # Apply filters/search/ordering manually since APIView doesn't auto-apply
        filter_backend = DjangoFilterBackend()
        projects = filter_backend.filter_queryset(request, projects, self)
        
        search_backend = filters.SearchFilter()
        projects = search_backend.filter_queryset(request, projects, self)
        
        ordering_backend = filters.OrderingFilter()
        projects = ordering_backend.filter_queryset(request, projects, self)
        
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)  # Auto-set owner
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        obj = get_object_or_404(Project, pk=pk)
        if obj.owner != user:
            raise status.HTTP_403_FORBIDDEN  # Or use Response with error
        return obj

    def get(self, request, pk):
        project = self.get_object(pk, request.user)
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    def put(self, request, pk):
        project = self.get_object(pk, request.user)
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = self.get_object(pk, request.user)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ... existing ProjectListView, ProjectDetailView ...

class ProjectTypeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        types = ProjectType.objects.all()
        serializer = ProjectTypeSerializer(types, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Restrict to admins if needed: permission_classes = [IsAdminUser]
        serializer = ProjectTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProjectTypeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        type_obj = get_object_or_404(ProjectType, pk=pk)
        serializer = ProjectTypeSerializer(type_obj)
        return Response(serializer.data)

    def put(self, request, pk):
        type_obj = get_object_or_404(ProjectType, pk=pk)
        serializer = ProjectTypeSerializer(type_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        type_obj = get_object_or_404(ProjectType, pk=pk)
        type_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)