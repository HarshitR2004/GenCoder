from django.urls import path
from . import views

urlpatterns = [
    path('generate', views.generate_testcase, name='generate_testcase'),
]