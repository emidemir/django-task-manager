from rest_framework import serializers

from .models import Project, Task, ProjectMember, Attachment, Comment
from users.serializers import UserSerializer
from users.models import User

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model=Task
        fields = '__all__'

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset = User.objects.all())
    class Meta:
        model = ProjectMember
        fields = '__all__'
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user'] = UserSerializer(instance.user).data
        return data

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

class CommentSerializer(serializers.ModelField):
    class Meta:
        model = Comment
        fields = '__all__'