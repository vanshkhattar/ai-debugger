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