# rusa/views.py
from django.shortcuts import render

def popular(request):
    return render(request, "html/popular.html")

def about(request):
    return render(request, "html/about.html")