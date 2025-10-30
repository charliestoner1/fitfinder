from django.urls import path
from . import views

urlpatterns = [
    path("test/", views.test, name="test"),
    path("wardrobe/items/", views.WardrobeItems.as_view(), name="wardrobe"),
    path("wardrobe/items/<int:pk>/", views.WardrobeItemsUpdateDelete.as_view(), name="delete"),
]