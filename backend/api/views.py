from django.shortcuts import render
from rest_framework import generics
from django.http import JsonResponse
from .models import Authenticate
from .serializers import AuthenticateSerializer

# Create your views here.
def test(request):
    data = {'message':'Hello from FitFinder'}
    return JsonResponse(data)

class ShowAuthenticate(generics.ListCreateAPIView):
    queryset = Authenticate.objects.all()
    serializer_class = AuthenticateSerializer
    