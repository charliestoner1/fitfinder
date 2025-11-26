from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class WardrobeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WardrobeItem
        fields = ["id", "item_image", "category", "season", "brand", "material", "price", "name", "tags"]

class OutfitItemSerializer(serializers.ModelSerializer):
    """
    Serializer for outfit items with nested clothing item data
    """
    clothing_item = WardrobeItemSerializer(read_only=True)
    clothing_item_id = serializers.PrimaryKeyRelatedField(
        queryset=WardrobeItem.objects.all(), source='clothing_item', write_only=True
    )

    class Meta:
        model = OutfitItem
        fields = [
            'id',
            'clothing_item',
            'clothing_item_id',
            'layer',
            'position_x',
            'position_y',
            'size_width',
            'size_height',
            'rotation',
            'z_index',
        ]

class OutfitSerializer(serializers.ModelSerializer):
    """
    Serializer for outfits with nested outfit items
    """
    items = OutfitItemSerializer(many=True, read_only=True)
    preview_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Outfit
        fields = [
            'id',
            'name',
            'occasion',
            'season',
            'preview_image_url',
            'created_at',
            'updated_at',
            'likes',
            'tags',
            'items',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_preview_image_url(self, obj):
        if obj.preview_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.preview_image.url)
        return None


class OutfitCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating outfits with items (for POST/PUT/PATCH)
    """
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    
    class Meta:
        model = Outfit
        fields = ['name', 'occasion', 'season', 'items', 'tags']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        if not user.is_authenticated:
            # For testing only - we'll need proper auth later
            user = User.objects.first()  # Use first user in DB for testing
    
        outfit = Outfit.objects.create(
            user=user,
            **validated_data
        )
        
        # Create outfit items
        for item_data in items_data:
            OutfitItem.objects.create(
                outfit=outfit,
                clothing_item_id=item_data['clothing_item_id'],
                layer=item_data['layer'],
                position_x=item_data['position_x'],
                position_y=item_data['position_y'],
                size_width=item_data['size_width'],
                size_height=item_data['size_height'],
                rotation=item_data['rotation'],
                z_index=item_data['z_index'],
            )
        
        return outfit
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update outfit fields
        instance.name = validated_data.get('name', instance.name)
        instance.occasion = validated_data.get('occasion', instance.occasion)
        instance.season = validated_data.get('season', instance.season)
        instance.tags = validated_data.get('tags', instance.tags)
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            
            # Create new items
            for item_data in items_data:
                OutfitItem.objects.create(
                    outfit=instance,
                    clothing_item_id=item_data['clothing_item_id'],
                    layer=item_data['layer'],
                    position_x=item_data['position_x'],
                    position_y=item_data['position_y'],
                    size_width=item_data['size_width'],
                    size_height=item_data['size_height'],
                    rotation=item_data['rotation'],
                    z_index=item_data['z_index'],
                )
        
        return instance


















