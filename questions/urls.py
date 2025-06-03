from django.urls import path
from .views import QuestionCreateView, QuestionDetailView, QuestionListView

urlpatterns = [
    path('', QuestionListView.as_view(), name='question-list'),
    path('create/', QuestionCreateView.as_view(), name='question-create'),
    path('<int:question_id>/', QuestionDetailView.as_view(), name='question-detail'),
]