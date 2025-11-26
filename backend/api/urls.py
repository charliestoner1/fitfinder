from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import (
    WardrobeItems,
    WardrobeItemsUpdateDelete,
    RegisterViewset,
    OutfitViewSet,
    AutoTagSuggestion,  
    test,
)


router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')
router.register('outfits', OutfitViewSet, basename='outfit')

urlpatterns = [
    path("", include(router.urls)),
    path("test/", views.test, name="test"),
    path("wardrobe/autotag-preview/", AutoTagSuggestion.as_view(), name="wardrobe-autotag-preview"),
    path("wardrobe/items/", views.WardrobeItems.as_view(), name="wardrobe"),
    path("wardrobe/items/<int:pk>/", views.WardrobeItemsUpdateDelete.as_view(), name="delete"),
]
