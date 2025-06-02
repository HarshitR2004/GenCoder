from django.urls import path
from . import views

urlpatterns = [
    path('users', views.UserAPIView.as_view(), name='user-create'),
    path('users/<int:user_id>/', views.UserAPIView.as_view(), name='user-detail'),
    path('login/', views.LoginAPIView.as_view(), name='login'),
]