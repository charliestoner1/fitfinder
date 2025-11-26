from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    WardrobeItems,
    WardrobeItemsUpdateDelete,
    RegisterViewset,
    OutfitViewSet,
    LoginViewset,
    LogoutViewset,
    test,
)

router = DefaultRouter()
router.register('auth/register', RegisterViewset, basename='register')
router.register('auth/login', LoginViewset, basename='login')
router.register('auth/logout', LogoutViewset, basename='logout')
router.register('outfits', OutfitViewSet, basename='outfit')

urlpatterns = [
    path("", include(router.urls)),
    path("test/", views.test, name="test"),
    path("wardrobe/items/", WardrobeItems.as_view(), name="wardrobe"),
    path("wardrobe/items/<int:pk>/", WardrobeItemsUpdateDelete.as_view(), name="delete"),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]