from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
from django.utils import timezone
# Create your models here.

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

    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = CustomUserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self):
        return self.username

class WardrobeItem(models.Model):
    CategoryType = models.TextChoices("Category", "Tops Bottoms Innerwear Outerwear Shoes Accessories Etc.")
    SeasonType = models.TextChoices("Season", "Spring Summer Fall Winter None")
    item_image = models.ImageField(blank=True, upload_to="wardrobe/items/images")
    category = models.CharField(blank=True, choices=CategoryType, max_length=11)
    season = models.CharField(blank=True, choices=SeasonType, max_length=10)
    brand = models.CharField(blank=True, max_length = 30)
    material = models.CharField(blank=True, max_length= 30)
    price = models.DecimalField(blank=True, null=True, max_digits=5, decimal_places=2)
    name = models.CharField(blank=False, max_length = 30)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    def __str__(self):
        return self.name 



