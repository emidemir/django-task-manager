from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from urllib.parse import parse_qs

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_key):
    try:
        # Validate the token
        access_token = AccessToken(token_key)
        user_id = access_token["user_id"]
        return User.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # 1. Extract the token from the query string
        query_string = parse_qs(scope["query_string"].decode("utf8"))
        token = query_string.get("token", [None])[0]

        # 2. If token exists, authenticate the user
        if token:
            scope["user"] = await get_user_from_token(token)
        else:   
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)