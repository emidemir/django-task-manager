import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.db.models import Q


@sync_to_async
def get_user_project_ids(user):
    from projects.models import Project
    # Get all project IDs where the user is EITHER the creator OR a team member
    projects = Project.objects.filter(
        Q(created_by=user) | Q(members__user=user)
    ).values_list('id', flat=True)
    
    return list(projects)

class UserAppConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("AAAAAAAA")
        self.user = self.scope["user"]

        # 1. Reject unauthenticated users
        if self.user.is_anonymous:
            print("Anon user !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            await self.close()
            return

        print("Inside the connext !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

        # 2. Add them to their personal notification group
        self.personal_group = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.personal_group, self.channel_name)

        # 3. Add them to the group for EVERY project they are a member of
        self.project_ids = await get_user_project_ids(self.user)
        for pid in self.project_ids:
            await self.channel_layer.group_add(f"project_{pid}", self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Clean up: Remove them from all groups when they close the app
        if hasattr(self, 'personal_group'):
            await self.channel_layer.group_discard(self.personal_group, self.channel_name)
            
            for pid in self.project_ids:
                await self.channel_layer.group_discard(f"project_{pid}", self.channel_name)

    # ---------------------------------------------------------
    # The master event handler
    # ---------------------------------------------------------
    async def broadcast_event(self, event):
        # Simply pass whatever payload the Signal sent straight to React
        await self.send(text_data=json.dumps({
            'type': event['payload']['type'],
            'payload': event['payload']
        }))