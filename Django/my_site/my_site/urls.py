from django.contrib import admin
from django.urls import include, path
from polls import views  # Импортируем views из polls

urlpatterns = [
    path("", views.index, name="home"), 
    path("polls/", include("polls.urls")),  
    path("admin/", admin.site.urls),  
]