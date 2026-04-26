from rest_framework import serializers
from .models import Project, ProjectType

class ProjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectType
        fields = ['id', 'name']

class ProjectSerializer(serializers.ModelSerializer):
    project_type = ProjectTypeSerializer(read_only=True)  # Or just id if not nesting
    project_type_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectType.objects.all(), source='project_type', write_only=True
    )  # For input as ID
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'project_type', 'project_type_id', 'start_date', 'end_date', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']