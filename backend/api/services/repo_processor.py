import os
from git import Repo
from api.services.embedding_service import get_embedding
import chromadb

chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(name="codebase")


def clone_repo(repo_url):
    base_path = "repos"

    if not os.path.exists(base_path):
        os.makedirs(base_path)

    repo_name = repo_url.split("/")[-1]
    local_path = os.path.join(base_path, repo_name)

    if not os.path.exists(local_path):
        Repo.clone_from(repo_url, local_path)

    return local_path


def get_code_files(repo_path):
    code_files = []
    ignore_dirs = ["__pycache__", ".git", "node_modules"]

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            if file.endswith((".py", ".js", ".ts", ".java", ".cpp")):
                code_files.append(os.path.join(root, file))

    return code_files


def chunk_code(file_path, chunk_size=500):
    chunks = []

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        for i in range(0, len(content), chunk_size):
            chunks.append(content[i:i+chunk_size])

    except Exception as e:
        print(f"Error reading {file_path}: {e}")

    return chunks


def store_chunks(chunks, file_path):
    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)

        collection.add(
            documents=[chunk],
            embeddings=[embedding],
            metadatas=[{"file": file_path}],
            ids=[f"{file_path}_{i}"]
        )


def retrieve_relevant_chunks(query, top_k=5):
    query_embedding = get_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results["documents"][0]