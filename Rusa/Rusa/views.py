# rusa/views.py
from django.shortcuts import render

def about(request):
    return render(request, "html/about.html")