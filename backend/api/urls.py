from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import (
    signup,
    login,
    ask_question,
)

urlpatterns = [
    path("signup/", signup),
    path("login/", login),
    path("ask/", ask_question),
    path("token/refresh/", TokenRefreshView.as_view()),
]