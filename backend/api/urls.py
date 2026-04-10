from django.urls import path
from .views import (
    ask_question,
    get_chats,
    save_chat,
    delete_all_chats,
    signup,
    login
)

urlpatterns = [

    # AI
    path("ask/", ask_question),

    # Chat APIs
    path("chats/", get_chats),
    path("save-chat/", save_chat),
    path("delete-all/", delete_all_chats),

    # AUTH
    path("signup/", signup),
    path("login/", login),
]