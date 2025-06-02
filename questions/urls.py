from django.urls import path
from .views import create_question

urlpatterns = [
    path('create/', create_question, name='create_question'),
]