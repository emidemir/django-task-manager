from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import ProjectViewset, TaskViewset, ProjectMemberViewset, AttachmentViewset, CommentViewset

router = DefaultRouter()

router.register(prefix=r'projects', viewset=ProjectViewset, basename='project')
router.register(prefix=r'projects/<str:project_id>/tasks', viewset=TaskViewset, basename='task')
router.register(prefix=r'projects/<str:project_id>/attachments', viewset=AttachmentViewset, basename='attachment')
router.register(prefix=r'projects/<str:project_id>/comments', viewset=CommentViewset, basename='comment')
router.register(prefix=r'projects/<str:project_id>/projectmembers', viewset=ProjectMemberViewset, basename='projectmember')

urlpatterns=[
    path('', include(router.urls))
]