from rest_framework import serializers

from .models import Project, Task, ProjectMember, Attachment, Comment
from users.serializers import UserSerializer
from users.models import User

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model=Task
        fields = '__all__'


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class ProjectMemberSerializer(serializers.ModelSerializer):
    # This nests the user object for reading (GET)
    user = UserBasicSerializer(read_only=True)
    
    # This allows you to pass just the user UUID when creating a member (POST)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )

    class Meta:
        model = ProjectMember
        fields = ['id', 'project', 'user', 'user_id', 'role', 'joined_at']

class ProjectSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    members = ProjectMemberSerializer(many=True, read_only=True)
    class Meta:
        model = Project
        fields = ['id', 'name', 'status', 'created_at', 'created_by', 'tasks', 'members']

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'