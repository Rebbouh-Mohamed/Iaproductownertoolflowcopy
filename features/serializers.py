from rest_framework import serializers
from .models import ProductVision, ProjectDesc,Feature,PreFeature

class ProductVisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVision
        fields = ['id', 'questions_answers', 'generated_at', 'updated_at']
        read_only_fields = ['id', 'generated_at', 'updated_at']

class ProjectDescSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDesc
        fields = ['id', 'details', 'generated_at', 'updated_at']
        read_only_fields = ['id', 'generated_at', 'updated_at']

# ... existing ...

class PreFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreFeature
        fields = ['id', 'title', 'description', 'category', 'project_types']

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['id', 'title', 'description', 'category', 'is_predefined', 'selected', 'source', 'generated_at', 'updated_at']
        read_only_fields = ['id', 'is_predefined', 'source', 'generated_at', 'updated_at']