from django.urls import path
from . import views

urlpatterns = [
    # Question operations
    path('', views.QuestionAPIView.as_view(), name='question-list-create'),
    path('<int:question_id>/', views.QuestionAPIView.as_view(), name='question-detail'),
    
    # Supporting endpoints
    path('languages/', views.LanguageListAPIView.as_view(), name='language-list'),
    path('topics/', views.TopicListAPIView.as_view(), name='topic-list'),
]