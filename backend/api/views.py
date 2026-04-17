from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password

from rest_framework_simplejwt.tokens import RefreshToken

from django.http import StreamingHttpResponse
import time

from .models import Chat
from .serializers import ChatSerializer

from api.services.repo_processor import retrieve_relevant_chunks
from api.services.answer_service import generate_answer


# ================= AUTH =================

@api_view(["POST"])
def signup(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "All fields required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(username=username, password=password)

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })


@api_view(["POST"])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })


# ================= AI (STREAMING) =================

@api_view(["POST"])
def ask_question(request):
    query = request.data.get("query")

    if not query:
        return Response({"error": "Query is required"}, status=400)

    def generate():
        try:
            # Step 1: retrieve chunks
            chunks = retrieve_relevant_chunks(query)

            # Step 2: generate answer
            answer = generate_answer(query, chunks)

            for char in answer:
                yield char
                time.sleep(0.01)

        except Exception as e:
            fallback = f"(Fallback) Error occurred.\nQuery: {query}"
            for char in fallback:
                yield char
                time.sleep(0.01)

    return StreamingHttpResponse(generate(), content_type="text/plain")


# ================= CHAT =================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chats(request):
    chats = Chat.objects.filter(user=request.user).order_by("-id")
    serializer = ChatSerializer(chats, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_chat(request):
    data = request.data.copy()
    data["user"] = request.user.id

    chat_id = data.get("id")

    if chat_id:
        chat = Chat.objects.filter(id=chat_id, user=request.user).first()
        if chat:
            serializer = ChatSerializer(chat, data=data, partial=True)
        else:
            serializer = ChatSerializer(data=data)
    else:
        serializer = ChatSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_all_chats(request):
    Chat.objects.filter(user=request.user).delete()
    return Response({"status": "deleted"})