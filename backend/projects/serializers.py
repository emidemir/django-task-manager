from rest_framework import serializers

from .models import Project, Task, ProjectMember, Attachment, Comment
from users.serializers import UserSerializer
from users.models import User

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

    # This intercepts the data right before it is sent to the frontend
    def to_representation(self, instance):
        response = super().to_representation(instance)
        # Swap the raw UUID strings for actual user dictionaries
        if instance.assigned_to:
            response['assigned_to'] = UserBasicSerializer(instance.assigned_to).data
        if instance.created_by:
            response['created_by'] = UserBasicSerializer(instance.created_by).data
        return response


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
        # Make sure 'color' is here!
        fields = ['id', 'name', 'description', 'status', 'color', 'created_at', 'created_by', 'tasks', 'members']
        read_only_fields = ['id', 'created_at', 'created_by']

    def create(self, validated_data):
        # This grabs the user from the request context provided by DRF
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'task', 'uploaded_by', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']

class CommentSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']