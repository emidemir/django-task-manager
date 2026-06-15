from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, LogoutView, SignupView, UserViewSet

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login_route'),
    path('signup/', SignupView.as_view(), name='logout_route'),
    path('logout/', LogoutView, name='signup_route'),
    path('', include(router.urls)),
]