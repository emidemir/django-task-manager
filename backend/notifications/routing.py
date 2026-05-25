from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('alerts/', consumers.AlertConsumer.as_asgi()),
    path('messages/', consumers.MessageConsumer.as_asgi()),
]