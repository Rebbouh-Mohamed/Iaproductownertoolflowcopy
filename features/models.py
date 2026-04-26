from django.db import models
from django.conf import settings
from projects.models import Project  

class ProductVision(models.Model):
    project = models.OneToOneField('projects.Project', on_delete=models.CASCADE, related_name='vision')
    questions_answers = models.JSONField(default=dict)  # e.g., {"Quel problème...": "Answer", ...}
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Vision for {self.project.name}"

class ProjectDesc(models.Model):
    project = models.OneToOneField('projects.Project', on_delete=models.CASCADE, related_name='description_page')
    details = models.JSONField(default=dict)  # e.g., {"Quelles fonctionnalités...": "Details", ...}
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Description for {self.project.name}"


class PreFeature(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    project_types = models.ManyToManyField('projects.ProjectType', related_name='pre_features')

    def __str__(self):
        return self.title

class Feature(models.Model):  # Renamed from FeatureSuggestion
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='features')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    is_predefined = models.BooleanField(default=False)
    selected = models.BooleanField(default=False)
    source = models.CharField(max_length=20, choices=[('template', 'Template'), ('user', 'User'), ('ai', 'AI')], default='template')
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title