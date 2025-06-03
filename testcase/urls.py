from django.urls import path
from .views import TestCaseCreateView, TestCaseDetailView

urlpatterns = [
    path('create/', TestCaseCreateView.as_view(), name='testcase-create'),
    path('<int:testcase_id>/', TestCaseDetailView.as_view(), name='testcase-detail'),
]