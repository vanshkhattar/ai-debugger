from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Chat
from .serializers import ChatSerializer

from api.services.repo_processor import retrieve_relevant_chunks
from api.services.answer_service import generate_answer

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import StreamingHttpResponse
import time
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# ✅ Test API


@api_view(["POST"])
def ask_question(request):
    query = request.data.get("query")

    def generate():
        response_text = "This is a streamed response from backend..."
        for char in response_text:
            yield char
            time.sleep(0.02)

    return StreamingHttpResponse(generate(), content_type="text/plain")


# ✅ AI Question API (SAFE VERSION)
@api_view(['POST'])
def ask_question(request):
    query = request.data.get("query")

    if not query:
        return Response(
            {"error": "Query is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        print("\n--- NEW REQUEST ---")
        print("Query:", query)

        # Step 1: retrieve relevant chunks
        chunks = retrieve_relevant_chunks(query)
        print("Chunks retrieved")

        # Step 2: generate answer
        answer = generate_answer(query, chunks)
        print("Answer generated")

        return Response({
            "query": query,
            "answer": answer
        })

    except Exception as e:
        print("ERROR:", str(e))

        # ✅ Fallback response (IMPORTANT for frontend stability)
        return Response({
            "query": query,
            "answer": f"(Fallback) AI failed. Showing basic response.\n\nYour query was: {query}"
        })


# ✅ Get all chats
@api_view(["GET"])
def get_chats(request):
    chats = Chat.objects.all().order_by("-id")
    serializer = ChatSerializer(chats, many=True)
    return Response(serializer.data)


# ✅ Save chat
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


# ✅ Delete all chats
@api_view(["DELETE"])
def delete_all_chats(request):
    Chat.objects.all().delete()
    return Response({"status": "deleted"})

# ✅ Signup
@api_view(["POST"])
def signup(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(username=username, password=password)

    return Response({"message": "User created successfully"})


# ✅ Login
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