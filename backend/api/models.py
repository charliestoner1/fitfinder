from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
from django.utils import timezone
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUserManager(UserManager):
    def create_user(self, username, email, first_name, last_name, password, **extra_fields):
        if not email:
            raise ValueError("Please enter an email address")
        user = self.model(
            username=username,
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_regular_user(self, username=None, email=None, password=None, first_name=None, last_name=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self.create_user(username, email, first_name, last_name, password, **extra_fields)
     
    def create_super_user(self, username=None, email=None, password=None, first_name=None, last_name=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, first_name, last_name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    user_type = models.CharField(max_length=30, default='regular')

    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = CustomUserManager()
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self):
        return self.username

class WardrobeItem(models.Model):
    class CategoryType(models.TextChoices):
        TOPS = "Tops", "Tops"
        BOTTOMS = "Bottoms", "Bottoms"
        MID_LAYER = "Mid Layer", "Mid Layer"
        OUTER_LAYER = "Outer Layer", "Outer Layer"
        ACCESSORY = "Accessory", "Accessory"
        OTHER = "Other", "Other"

    class SeasonType(models.TextChoices):
        SPRING = "Spring", "Spring"
        SUMMER = "Summer", "Summer"
        FALL = "Fall", "Fall"
        WINTER = "Winter", "Winter"
        NONE = "None", "None"

    item_image = models.ImageField(blank=True, upload_to="wardrobe/items/images")
    category = models.CharField(
        blank=True,
        choices=CategoryType.choices,
        max_length=20,   
    )
    season = models.CharField(
        blank=True,
        choices=SeasonType.choices,
        max_length=10,
    )
    brand = models.CharField(blank=True, max_length=30)
    material = models.CharField(blank=True, max_length=30)
    price = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    name = models.CharField(blank=False, max_length=30)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    tags = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.name

# outfit models

class Outfit(models.Model):
    """
    Represents a saved outfit created by a user
    """
    OCCASION_CHOICES = [
        ('casual', 'Casual'),
        ('work', 'Work'),
        ('formal', 'Formal'),
        ('party', 'Party'),
        ('date', 'Date'),
        ('gym', 'Gym'),
        ('outdoor', 'Outdoor'),
        ('beach', 'Beach'),
    ]
    
    SEASON_CHOICES = [
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('fall', 'Fall'),
        ('winter', 'Winter'),
        ('all', 'All Seasons'),
    ]
    
    # Basic fields
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outfits')
    name = models.CharField(max_length=100)
    occasion = models.CharField(max_length=20, choices=OCCASION_CHOICES, blank=True, null=True)
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, blank=True, null=True)
    
    # Optional preview image 
    preview_image = models.ImageField(upload_to='outfits/previews/', blank=True, null=True)
    
    # Favorites and scheduling
    is_favorite = models.BooleanField(default=False)
    scheduled_date = models.DateTimeField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.IntegerField(default=0)
    tags = models.JSONField(default=list, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} - {self.user.username}"


class OutfitItem(models.Model):
    """
    Represents a clothing item placed in an outfit with position/size data
    """
    LAYER_CHOICES = [
        ('tops', 'Tops'),
        ('bottoms', 'Bottoms'),
        ('mid', 'Mid Layer'),
        ('outer', 'Outer Layer'),
        ('accessory', 'Accessory'),
    ]
    
    outfit = models.ForeignKey(Outfit, on_delete=models.CASCADE, related_name='items')
    clothing_item = models.ForeignKey(WardrobeItem, on_delete=models.CASCADE)
    
    # Layer management
    layer = models.CharField(max_length=20, choices=LAYER_CHOICES)
    z_index = models.IntegerField(default=0)
    
    # Position on canvas
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    
    # Size on canvas
    size_width = models.FloatField(default=150)
    size_height = models.FloatField(default=150)
    
    # Rotation
    rotation = models.FloatField(default=0)  # Degrees (0-360)
    
    class Meta:
        ordering = ['z_index']
        
    def __str__(self):
        return f"{self.clothing_item.name} in {self.outfit.name}"

class Recommendation(models.Model):
    """
    Represents a smart outfit recommendation for a user based on context
    """
    WEATHER_CHOICES = [
        ('sunny', 'Sunny'),
        ('cloudy', 'Cloudy'),
        ('rainy', 'Rainy'),
        ('snowy', 'Snowy'),
        ('hot', 'Hot'),
        ('cold', 'Cold'),
    ]
    
    OCCASION_CHOICES = [
        ('casual', 'Casual'),
        ('professional', 'Professional'),
        ('formal', 'Formal'),
        ('party', 'Party'),
        ('date', 'Date'),
        ('gym', 'Gym'),
        ('outdoor', 'Outdoor'),
        ('beach', 'Beach'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Context
    weather = models.CharField(max_length=20, choices=WEATHER_CHOICES)
    occasion = models.CharField(max_length=20, choices=OCCASION_CHOICES)
    temperature = models.IntegerField(null=True, blank=True)  # Celsius
    
    # Recommended items (could be multiple outfits)
    recommended_items = models.ManyToManyField(WardrobeItem, related_name='recommendations')
    
    # Scores & explanation
    compatibility_score = models.FloatField(default=0.0)  # 0-100
    explanation = models.TextField()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Recommendation for {self.user.username} - {self.occasion} ({self.weather})"


# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_auth_token(sender, instance=None, created=False, **kwargs):
#     if created:
#         Token.objects.create(user=instance)
#         RefreshToken.objects.create(user=instance) 
