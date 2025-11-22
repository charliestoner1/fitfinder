from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')

urlpatterns = [
    path("test/", views.test, name="test"),
    path("wardrobe/items/", views.WardrobeItems.as_view(), name="wardrobe"),
    path("wardrobe/items/<int:pk>/", views.WardrobeItemsUpdateDelete.as_view(), name="delete"),
    path("api/auth/register/", views.RegisterViewset.as_view({'post': 'create'}), name="register"),
]