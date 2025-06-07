from django.urls import path
from .views import QuestionAPIView

urlpatterns = [
    path('upload', QuestionAPIView.as_view(), name='upload_question'),
]