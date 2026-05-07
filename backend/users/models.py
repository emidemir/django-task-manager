# users/models.py

import uuid

from django.db import models
from django.contrib.auth.models import AbstractUser

# from django.contrib.auth import get_user_model
# User = get_user_model()

def user_avatar_image(instance, filename):
   return f"images/avatars/{instance.id}/{filename}" 

# In case you migrated the model before settings the id as uuid, follow the steps in the following link.
# https://stackoverflow.com/a/63908961/17799171
class User(AbstractUser):
   id = models.UUIDField(primary_key=True,editable=False,default=uuid.uuid4,unique=True)
   avatar_url = models.ImageField(upload_to=user_avatar_image)
   created_at = models.DateTimeField(auto_now_add=True)
   last_seen = models.DateTimeField(null=True, blank=True)