from django.urls import path 

from .views import LoginView, LogoutView, SignupView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login_route'),
    path('signup/', SignupView.as_view(), name='logout_route'),
    path('logout/', LogoutView, name='signup_route'),
]