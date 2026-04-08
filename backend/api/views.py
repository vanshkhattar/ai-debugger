from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Chat
from .serializers import ChatSerializer

from api.services.repo_processor import retrieve_relevant_chunks
from api.services.answer_service import generate_answer


# ✅ Test API
@api_view(["GET"])
def test(request):
    return Response({"message": "API working"})


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
def save_chat(request):
    serializer = ChatSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {"status": "saved"},
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# ✅ Delete all chats
@api_view(["DELETE"])
def delete_all_chats(request):
    Chat.objects.all().delete()
    return Response({"status": "deleted"})