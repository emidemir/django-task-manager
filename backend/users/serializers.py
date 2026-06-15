from rest_framework import serializers

from .models import User


class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields = ['id', 'avatar_url', 'username', 'first_name', 'last_name', 'email']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class SignupSerializer(serializers.ModelSerializer):
    password_match = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['first_name','last_name','email','password','password_match']
        extra_kwargs={'password':{'write_only':True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password_match']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_match')
        validated_data['username'] = f"{validated_data['first_name']}-{validated_data['last_name']}"
        
        # When you send a POST request to a CreateAPIView, DRF triggers a specific chain of events. 
        # Neither the view nor the default serializer knows that your password field needs special cryptographic treatment. 
        # They just treat it like any other text field (like first_name or email).
        user = User.objects.create_user(**validated_data)
        return user