from django.contrib import admin

from .models import Project, Task, ProjectMember, Attachment, Comment

# Register your models here.
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(ProjectMember)
admin.site.register(Attachment)
admin.site.register(Comment)
