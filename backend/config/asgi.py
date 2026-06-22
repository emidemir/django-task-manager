# In case of ->>> django.core.exceptions.ImproperlyConfigured: Cannot import ASGI_APPLICATION module 'config.asgi' <<<-
# Use the following.
# https://stackoverflow.com/a/63424784/17799171

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

# 1. Initialize Django FIRST
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django_asgi_app = get_asgi_application()

# 2. Import your custom middleware and routing SECOND
# (This ensures Django models are fully loaded before these files are read)
from .middlewares import JWTAuthMiddleware
from .routing import websocket_urlpatterns

# 3. Build the application
application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            # Notice AuthMiddlewareStack is removed, relying purely on your JWT logic
            JWTAuthMiddleware(
                URLRouter(websocket_urlpatterns)
            )
        ),
    }
)