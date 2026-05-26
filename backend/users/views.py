from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate


from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, SignupSerializer, UserSerializer

User = get_user_model()

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.get(email=serializer.validated_data['email'])
        
        user = authenticate(request=request, username=getattr(user, 'username'), password=serializer.validated_data['password'])
        print(user)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response(data={
                'user': UserSerializer(user).data,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }, status=status.HTTP_200_OK)
        else:
            return Response(data={'msg':'User not found!!'}, status=status.HTTP_400_BAD_REQUEST)


class SignupView(CreateAPIView):
    queryset= User.objects.all()
    serializer_class = SignupSerializer

@api_view(['POST'])
def LogoutView(request):
    try:
        refresh = request.data.get('refresh')
        token = RefreshToken(refresh)
        token.blacklist()
        return Response(data={'msg': 'Successfully logged out.'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as E:
        return Response(data={'msg': str(E)}, status=status.HTTP_400_BAD_REQUEST)
