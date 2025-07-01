from django.urls import path
from . import views

urlpatterns = [
    # Question endpoints
    path('list/', views.QuestionListAPIView.as_view(), name='question-list'),
    path('create/', views.QuestionCreateView.as_view(), name='question-create'),
    path('<int:question_id>/', views.QuestionDetailView.as_view(), name='question-detail'),
    
    # Language endpoints
    path('languages/', views.LanguageListAPIView.as_view(), name='language-list'),
    
    # Topic endpoints
    path('topics/', views.TopicListAPIView.as_view(), name='topic-list'),
]