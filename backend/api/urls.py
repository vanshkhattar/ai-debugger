from django.urls import path
from .views import test

urlpatterns = [
    path("test/", test),
]

from django.urls import path
from .views import ask_question

urlpatterns = [
    path('ask/', ask_question),
]