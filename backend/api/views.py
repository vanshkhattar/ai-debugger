from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def test(request):
    return Response({"message": "API working"})

from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.services.repo_processor import retrieve_relevant_chunks
from api.services.answer_service import generate_answer


@api_view(['POST'])
def ask_question(request):
    query = request.data.get("query")

    if not query:
        return Response({"error": "Query is required"}, status=400)

    # Step 1: retrieve code
    chunks = retrieve_relevant_chunks(query)

    # Step 2: generate answer
    answer = generate_answer(query, chunks)

    return Response({
        "query": query,
        "answer": answer
    })