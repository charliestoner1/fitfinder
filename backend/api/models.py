from django.db import models

# Create your models here.

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
    def __str__(self):
        return self.name  
