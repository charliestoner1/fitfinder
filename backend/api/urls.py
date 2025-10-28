from django.urls import path
from . import views

urlpatterns = [
    path("authpage/", views.test, name="test")
]