from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet

from .models import Project, Task, ProjectMember, Attachment, Comment
from .serializers import ProjectSerializer, TaskSerializer, ProjectMemberSerializer, AttachmentSerializer, CommentSerializer
from .permissions import IsTeamMember, IsProjectMember, TeamMemberViewsetPermission

class ProjectViewset(ModelViewSet):
    serializer_class=ProjectSerializer
    permission_classes = [IsProjectMember]

    def get_queryset(self):
        # Use select_related and prefetch_related for preventing the classic N+1 problem.
        return Project.objects.filter(created_by=self.request.user).prefetch_related('tasks','members', 'tasks__created_by', 'tasks__assigned_to', 'members__user')

class TaskViewset(ModelViewSet):
    serializer_class= TaskSerializer
    permission_classes = [IsTeamMember]

    def get_queryset(self):
        return Task.objects.filter(project=self.kwargs['project_id']).select_related('created_by', 'assigned_to')
    
class ProjectMemberViewset(ModelViewSet):
    serializer_class = ProjectMemberSerializer
    permission_classes = [TeamMemberViewsetPermission]

    def get_queryset(self):
        return ProjectMember.objects.filter(project=self.kwargs['project_id']).select_related('user')
    
class AttachmentViewset(ModelViewSet):
    serializer_class = AttachmentSerializer

    def get_queryset(self):
        return Attachment.objects.filter(task__project=self.kwargs['project_id'])
    
class CommentViewset(ModelViewSet):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(task__project=self.kwargs['project_id'])
