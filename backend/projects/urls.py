from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewset, TaskViewset, ProjectMemberViewset, AttachmentViewset, CommentViewset

router = DefaultRouter()

router.register(r'projects', ProjectViewset, basename='project')
router.register(r'tasks', TaskViewset, basename='task')
router.register(r'attachments', AttachmentViewset, basename='attachment')
router.register(r'comments', CommentViewset, basename='comment')
router.register(r'members', ProjectMemberViewset, basename='member')

urlpatterns = [
    path('', include(router.urls))
]