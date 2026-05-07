from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import ProjectMember

class IsTeamMember(BasePermission):
    
    def has_permission(self, request, view):
        project_id = view.kwargs.get('project_id')

        return ProjectMember.objects.filter(project=project_id, user=request.user).exists()
    
class IsProjectMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request in SAFE_METHODS:
            return ProjectMember.objects.filter(project=obj, user=request.user).exists()
        if obj.created_by == request.user:
            return True
        
        return ProjectMember.objects.filter(
            project=obj,
            user=request.user,
            role='admin'
        ).exists()
        
class TeamMemberViewsetPermission(BasePermission):
    def has_permission(self, request, view):
        project_id = view.kwargs.get('project_id')

        return ProjectMember.objects.filter(project=project_id, user=request.user).exists()
    
    def has_object_permission(self, request, view, obj):
        if request in SAFE_METHODS:
            project_id = request.kwargs.get('project_id')
            return ProjectMember.objects.filter(project=project_id, user=request.user).exists()
        
        return ProjectMember.objects.filter(
            project=obj,
            user=request.user,
            role='admin'
        ).exists()