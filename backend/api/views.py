from django.shortcuts import render
from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from django.http import JsonResponse
from .models import *
from .serializers import *
User = get_user_model()

class WardrobeItems(generics.ListCreateAPIView):
    queryset = WardrobeItem.objects.all()
    serializer_class = WardrobeItemSerializer

class WardrobeItemsUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = WardrobeItem.objects.all()
    serializer_class = WardrobeItemSerializer
    lookup_field = "pk"

class RegisterViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

# Create your views here.
def test(request):
    message = "Hello from Fitfinder :)"
    return JsonResponse(message, safe=False)


    