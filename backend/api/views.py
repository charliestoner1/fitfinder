from django.shortcuts import render
from rest_framework import generics
from django.http import JsonResponse
from .models import WardrobeItem
from .serializers import WardrobeItemSerializer 

class WardrobeItems(generics.ListCreateAPIView):
    queryset = WardrobeItem.objects.all()
    serializer_class = WardrobeItemSerializer

class WardrobeItemsUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = WardrobeItem.objects.all()
    serializer_class = WardrobeItemSerializer
    lookup_field = "pk"

# Create your views here.
def test(request):
    message = "Hello from Fitfinder :)"
    return JsonResponse(message, safe=False)


    