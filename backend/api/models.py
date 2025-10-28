from django.db import models

# Create your models here.
class Authenticate(models.Model):
    username = "Thai-Son"
    password = "12345"

    def __str__(self):
        return self.username
        return self.password

