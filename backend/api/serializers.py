from rest_framework import serializers
from . models import Authenticate

class AuthenticateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Authenticate
        fields = ["username", "password"]
        