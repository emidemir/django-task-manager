from django.urls import path
from .consumers import ProjectUpdateConsumer, ProjectStatusConsumer

websocket_urlpatterns = [
    path('<int:project_id>/', ProjectUpdateConsumer.as_asgi()),
    path('status/', ProjectStatusConsumer.as_asgi()),
]