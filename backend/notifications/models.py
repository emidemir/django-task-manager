# notifications/models.py

import uuid

from django.db import models
from django.contrib.auth import get_user_model

from projects.models import Task

User = get_user_model()

# Create your models here.
class Notification(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, unique=True, default=uuid.uuid4)
    recepient = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    task = models.ForeignKey(Task, related_name='notifications', on_delete=models.CASCADE)
    type = models.CharField(max_length=150) # JUST FOR NOW. CHANGE THIS WITH CATEGORICAL LATER
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)