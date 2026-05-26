from rest_framework.viewsets import ModelViewSet

from django.db.models import Q

from .models import Project, Task, ProjectMember, Attachment, Comment
from .serializers import ProjectSerializer, TaskSerializer, ProjectMemberSerializer, AttachmentSerializer, CommentSerializer
from .permissions import IsTeamMember, IsProjectMember, TeamMemberViewsetPermission

class ProjectViewset(ModelViewSet):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        # Return projects the user created OR is a member of
        return Project.objects.filter(
            Q(created_by=self.request.user) | 
            Q(members__user=self.request.user)
        ).distinct()

class TaskViewset(ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        # 1. Start with tasks in projects the user has access to
        user_projects = ProjectMember.objects.filter(user=self.request.user).values_list('project_id', flat=True)
        queryset = Task.objects.filter(
            Q(project__id__in=user_projects) | 
            Q(project__created_by=self.request.user)
        ).distinct()

        # 2. Filter by specific project if requested via query param
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        return queryset
    
class ProjectMemberViewset(ModelViewSet):
    serializer_class = ProjectMemberSerializer
    permission_classes = [TeamMemberViewsetPermission]

    def get_queryset(self):
        # Start with project members from projects the user has access to
        user_projects = Project.objects.filter(
            Q(created_by=self.request.user) |
            Q(members__user=self.request.user)
        ).distinct()

        queryset = ProjectMember.objects.filter(
            project__in=user_projects
        ).select_related('user', 'project')

        # Filter by specific project if requested
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset

class AttachmentViewset(ModelViewSet):
    serializer_class = AttachmentSerializer

    def get_queryset(self):
        # Start with attachments in projects the user has access to
        user_projects = Project.objects.filter(
            Q(created_by=self.request.user) |
            Q(members__user=self.request.user)
        ).distinct()

        queryset = Attachment.objects.filter(
            task__project__in=user_projects
        ).select_related('task', 'uploaded_by')

        # Filter by specific project if requested
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(task__project_id=project_id)

        # Filter by specific task if requested
        task_id = self.request.query_params.get('task')
        if task_id:
            queryset = queryset.filter(task_id=task_id)

        return queryset
    
class CommentViewset(ModelViewSet):
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        queryset = Comment.objects.all() # Add permission filtering here like above
        task_id = self.request.query_params.get('task')
        project_id = self.request.query_params.get('project')
        
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        if project_id:
            queryset = queryset.filter(task__project_id=project_id)
            
        return queryset
