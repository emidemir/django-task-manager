from django.urls import path
from channels.routing import URLRouter

import projects.routing
import notifications.routing

websocket_urlpatterns = [
    path('ws/updates/', URLRouter(projects.routing.websocket_urlpatterns)),
    path('ws/notifications/', URLRouter(notifications.routing.websocket_urlpatterns)),
]