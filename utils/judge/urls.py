from django.urls import path
from .views import ExecuteCodeAPIView

urlpatterns = [
    path('execute', ExecuteCodeAPIView.as_view(), name='execute-code'),
]

