from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('<int:project_id>/', consumers.ProjectUpdateConsumer.as_asgi()),
    path('status/', consumers.ProjectStatusConsumer.as_asgi()),
]