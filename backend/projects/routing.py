from django.urls import path
from .import consumers

websocket_urlpatterns = [
    path('', consumers.UserAppConsumer.as_asgi()),
]