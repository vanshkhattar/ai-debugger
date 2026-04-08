from django.urls import path
from .views import (
    test,
    ask_question,
    get_chats,
    save_chat,
    delete_all_chats
)

urlpatterns = [
    # Test route
    path("test/", test),

    # AI endpoint
    path("ask/", ask_question),

    # Chat APIs
    path("chats/", get_chats),
    path("save-chat/", save_chat),
    path("delete-all/", delete_all_chats),
]