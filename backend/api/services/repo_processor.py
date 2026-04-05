import os
from git import Repo

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

    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file.endswith((".py", ".js", ".ts", ".java", ".cpp")):
                full_path = os.path.join(root, file)
                code_files.append(full_path)

    return code_files

def chunk_code(file_path, chunk_size=500):
    chunks = []

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        for i in range(0, len(content), chunk_size):
            chunk = content[i:i+chunk_size]
            chunks.append(chunk)

    except Exception as e:
        print(f"Error reading {file_path}: {e}")

    return chunks