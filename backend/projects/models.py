# projects/models.py

import uuid

from django.db import models

from users.models import User

class Project(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    description = models.TextField()

    class ProjectStatus(models.TextChoices):
        ONGOING = "Ongoing", "Ongoing"
        FINISHED = "Finished", "Finished"
    status = models.CharField(max_length=8, choices=ProjectStatus.choices, default=ProjectStatus.ONGOING)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='projects', on_delete=models.CASCADE)

    class Meta:
        indexes = [models.Index(fields=['created_by', 'created_at'])]

class Task(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, related_name='tasks', on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, related_name='created_tasks', on_delete=models.PROTECT)
    assigned_to = models.ForeignKey(User, related_name='assigned_tasks', on_delete=models.PROTECT)

    title = models.CharField(max_length=150)
    description = models.TextField()
    
    class TaskStatus(models.TextChoices):
        ONGOIN = "Ongoing", "Ongoing"
        TODO = "Todo", "Todo"
        FINISHED = "Finished", "Finished"
    status = models.CharField(max_length=8, choices=TaskStatus.choices, default=TaskStatus.ONGOIN)

    class TaskPriority(models.TextChoices):
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"
        CRITICAL = "Critical", "Critical"
    priority = models.CharField(max_length=8, choices=TaskPriority.choices, null=True, blank=True)

    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=['created_by', 'created_at', 'due_date'])]

class ProjectMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    project = models.ForeignKey(Project, related_name='members', on_delete=models.PROTECT)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50) # JSUT FOR NOW, MODIFY THIS LATER!
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['user'])]

def file_upload_path(instance, filename):
    return f"documents/{instance.id}/{filename}"

class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, unique=True, default=uuid.uuid4)
    task = models.ForeignKey(Task, related_name='attachments', on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(User, on_delete=models.PROTECT)
    file = models.FileField(upload_to=file_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['uploaded_by', 'task'])]

class Comment(models.Model):
    id = models.UUIDField(primary_key=True,editable=False,default=uuid.uuid4,unique=True)
    task = models.ForeignKey(Task, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='comment', on_delete=models.CASCADE)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=['task', 'user'])]
