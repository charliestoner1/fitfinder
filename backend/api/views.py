from django.shortcuts import render
from rest_framework import generics, viewsets, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import JsonResponse
from PIL import Image

from .models import *
from .serializers import *
from .autotagger import (
    run_autotagger,
    infer_category_from_type_tags,
    build_item_name_from_tags,
)

User = get_user_model()

class WardrobeItems(generics.ListCreateAPIView):
    queryset = WardrobeItem.objects.all()
    serializer_class = WardrobeItemSerializer
    def perform_create(self, serializer):
        """
        Save wardrobe item, then auto-tag the image and infer category if missing.
        """
        # 1) Save the instance first
        instance = serializer.save()

        # 2) If there is no image, nothing to tag
        if not instance.item_image:
            return

        try:
            # 3) Run the Florence-2 autotagger on the saved image file
            tags, caption = run_autotagger(instance.item_image.path)
        except Exception as e:
            # Don't break uploads if the model errors out
            print(f"[Autotagger] Error processing image {instance.pk}: {e}")
            return

        # 4) Store tags dict into the JSONField
        #    (fallback to {} in case tags is None)
        instance.tags = tags or {}

        # 5) Infer category from type tags ONLY if user left category blank
        if not instance.category:
            type_tags = (tags or {}).get("type") or []
            inferred_category = infer_category_from_type_tags(type_tags)
            if inferred_category:
                instance.category = inferred_category

        instance.save()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_anonymous:
            return WardrobeItem.objects.filter(user = user)
        else:
            return WardrobeItem.objects.none()
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ViewAllWardrobeItems(generics.ListCreateAPIView):
    queryset = WardrobeItem.objects.all()
    serializer_class = WardrobeItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return WardrobeItem.objects.all()


class WardrobeItemsUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = WardrobeItem.objects.all()
    serializer_class = WardrobeItemSerializer
    lookup_field = "pk"

class AutoTagSuggestion(APIView):
    """
    Accepts an image file and returns suggested name, category, and raw tags,
    without creating a WardrobeItem.
    """

    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get("item_image") or request.FILES.get("image")
        if not file_obj:
            return Response(
                {"detail": "No image file provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            image = Image.open(file_obj).convert("RGB")
            tags, caption = run_autotagger(image)
            suggested_name = build_item_name_from_tags(tags, caption)
            suggested_category = infer_category_from_type_tags(tags, caption)

        except Exception as exc:
            # Log for debugging, but keep response generic
            print("[autotag-preview] error:", exc)
            return Response(
                {"detail": "Failed to generate auto tags."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "tags": tags,
                "caption": caption,
                "suggested_name": suggested_name,
                "suggested_category": suggested_category,
            },
            status=status.HTTP_200_OK,
        )

class RegisterViewset(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            return_data = {}
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            return_data['access'] = str(access)
            return_data['refresh'] = str(refresh)
            return_data['user'] = self.serializer_class(user).data
            return Response(return_data)
        else:
            return Response(serializer.errors, status=312)
    def list(self, request):
        users = self.queryset
        serializer = self.serializer_class(users, many=True)
        return Response(serializer.data)

class LoginViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            return_data = {}
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            return_data['access'] = str(access)
            return_data['refresh'] = str(refresh)
            return_data['user'] = UserSerializer(user).data
            return Response(return_data)
        else:
            return Response(serializer.errors, status=400)

class GetCurrentUser(generics.GenericAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    def get(self, request):
        print(self.request.user)
        if self.request.user.is_authenticated:
            user = UserSerializer(self.request.user).data
            print("Current user data:", user)
            return Response(user)
        else:
            return Response(User.objects.none())
        

class LogoutViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    def create(self, request):
        try:
            existing_refresh = RefreshToken(request.data.get("refresh"))
            existing_access = AccessToken(request.data.get("access"))
            existing_refresh.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)

class OutfitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for outfit CRUD operations
    Endpoints:
    - GET /api/outfits/ - List all user's outfits
    - POST /api/outfits/ - Create new outfit
    - GET /api/outfits/{id}/ - Get specific outfit
    - PUT/PATCH /api/outfits/{id}/ - Update outfit
    - DELETE /api/outfits/{id}/ - Delete outfit
    - POST /api/outfits/{id}/upload-preview/ - Upload preview image
    """
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        # Only return outfits for the current user
        #if self.request.user.is_authenticated:
           # return Outfit.objects.filter(user=self.request.user).prefetch_related('items__clothing_item')
        #return Outfit.objects.none()  # Return empty queryset for anonymous users
        return Outfit.objects.all().prefetch_related('items__clothing_item')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return OutfitCreateUpdateSerializer
        return OutfitSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a new outfit
        POST /api/outfits/
        
        Expected JSON:
        {
            "name": "Summer Casual",
            "occasion": "casual",
            "season": "summer",
            "items": [
                {
                    "clothing_item_id": "1",
                    "layer": "tops",
                    "position_x": 100,
                    "position_y": 50,
                    "size_width": 150,
                    "size_height": 150,
                    "rotation": 0,
                    "z_index": 1
                }
            ]
        }
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        outfit = serializer.save()
        
        # Return full outfit data with nested items
        output_serializer = OutfitSerializer(outfit, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """
        Update an existing outfit
        PUT/PATCH /api/outfits/{id}/
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        outfit = serializer.save()
        
        # Return full outfit data
        output_serializer = OutfitSerializer(outfit, context={'request': request})
        return Response(output_serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_preview(self, request, pk=None):
        """
        Upload a preview image for an outfit
        POST /api/outfits/{id}/upload-preview/
        
        Expects: multipart/form-data with 'preview_image' file
        """
        outfit = self.get_object()
        
        if 'preview_image' not in request.FILES:
            return Response(
                {'error': 'No preview_image file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        outfit.preview_image = request.FILES['preview_image']
        outfit.save()
        
        serializer = OutfitSerializer(outfit, context={'request': request})
        return Response({
            'preview_image_url': serializer.data['preview_image_url']
        })