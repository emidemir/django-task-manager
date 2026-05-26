from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Project, Task, ProjectMember, Attachment, Comment

# Helper function to keep code DRY
def broadcast(group_name, payload):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'broadcast_event', # This matches the method in your UserAppConsumer
            'payload': payload
        }
    )

# === PROJECT RELATED SIGNALS ===
@receiver(post_save, sender=Project)
def project_save_signal(sender, instance, created, **kwargs):
    event_type = 'project.created' if created else 'project.updated'
    payload = {
        'type': event_type,
        'projectId': str(instance.id)
    }
    
    # Broadcast to the project room
    broadcast(f'project_{instance.id}', payload)
    
    if created:
        # If it's a new project, explicitly tell the creator so their sidebar updates
        broadcast(f'user_{instance.created_by.id}', payload)

@receiver(post_delete, sender=Project)
def project_delete_signal(sender, instance, **kwargs):
    broadcast(f'project_{instance.id}', {
        'type': 'project.deleted',
        'projectId': str(instance.id)
    })

# === TASK RELATED SIGNALS ===
@receiver(post_save, sender=Task)
def task_save_signal(sender, instance, created, **kwargs):
    event_type = 'task.created' if created else 'task.updated'
    print("Should see something here!!!!!!!!!")
    broadcast(f'project_{instance.project.id}', {
        'type': event_type,
        'taskId': str(instance.id),
        'projectId': str(instance.project.id)
    })

@receiver(post_delete, sender=Task)
def task_delete_signal(sender, instance, **kwargs):
    broadcast(f'project_{instance.project.id}', {
        'type': 'task.deleted',
        'taskId': str(instance.id),
        'projectId': str(instance.project.id)
    })

# === PROJECTMEMBER RELATED SIGNALS ===
@receiver(post_save, sender=ProjectMember)
def project_member_save_signal(sender, instance, created, **kwargs):
    if created:
        # Tell the project room someone was added
        broadcast(f'project_{instance.project.id}', {
            'type': 'member.added',
            'projectId': str(instance.project.id)
        })
        
        # Tell the newly added user specifically, so their frontend fetches the new project
        broadcast(f'user_{instance.user.id}', {
            'type': 'project.created', 
            'projectId': str(instance.project.id)
        })
    else:
        # If updating a role, you might want a 'member.updated' event later
        pass

@receiver(post_delete, sender=ProjectMember)
def project_member_delete_signal(sender, instance, **kwargs):
    broadcast(f'project_{instance.project.id}', {
        'type': 'member.removed',
        'projectId': str(instance.project.id)
    })
    # Tell the removed user so the project disappears from their screen
    broadcast(f'user_{instance.user.id}', {
        'type': 'project.deleted', 
        'projectId': str(instance.project.id)
    })

# === ATTACHMENT RELATED SIGNALS ===
@receiver(post_save, sender=Attachment)
def attachment_save_signal(sender, instance, created, **kwargs):
    if created:
        broadcast(f'project_{instance.task.project.id}', {
            'type': 'attachment.uploaded',
            'projectId': str(instance.task.project.id),
            'taskId': str(instance.task.id)
        })

@receiver(post_delete, sender=Attachment)
def attachment_delete_signal(sender, instance, **kwargs):
    broadcast(f'project_{instance.task.project.id}', {
        'type': 'attachment.deleted',
        'projectId': str(instance.task.project.id),
        'taskId': str(instance.task.id)
    })

# === COMMENT RELATED SIGNALS ===
@receiver(post_save, sender=Comment)
def comment_save_signal(sender, instance, created, **kwargs):
    if created:
        broadcast(f'project_{instance.task.project.id}', {
            'type': 'comment.created',
            'projectId': str(instance.task.project.id),
            'taskId': str(instance.task.id)
        })

@receiver(post_delete, sender=Comment)
def comment_delete_signal(sender, instance, **kwargs):
    broadcast(f'project_{instance.task.project.id}', {
        'type': 'comment.deleted',
        'projectId': str(instance.task.project.id),
        'taskId': str(instance.task.id)
    })