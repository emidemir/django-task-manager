from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .documents import UserDocument

from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, SignupSerializer, UserSerializer, UserSearchSerializer

User = get_user_model()

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.get(email=serializer.validated_data['email'])
        
        user = authenticate(request=request, username=getattr(user, 'username'), password=serializer.validated_data['password'])
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

class UserViewSet(ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def search(self, request):
        # Add .strip() just in case the user accidentally pastes a space
        query = request.query_params.get('email', '').strip()
        if not query:
            return Response([])

        # Use a strict 'term' query instead of a fuzzy 'multi_match'
        search_query = UserDocument.search().query(
            "term",
            email=query
        )

        es_ids = [hit.meta.id for hit in search_query]
        
        # Security: Only return active users
        queryset = self.get_queryset().filter(id__in=es_ids, is_active=True)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)