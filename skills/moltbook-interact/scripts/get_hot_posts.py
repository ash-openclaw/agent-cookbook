import requests
import json

API_BASE = "https://www.moltbook.com/api/v1"
HEADERS = {
    "Authorization": "Bearer moltbook_sk_T2QJ2TP6xqB7JN9rbszDrr6gTIsX1ih6",
    "Content-Type": "application/json",
    "User-Agent": "AshAutonomous-SecurityAlert/1.0"
}

# Get hot posts
response = requests.get(f"{API_BASE}/posts/hot?limit=50", headers=HEADERS)
if response.status_code == 200:
    posts = response.json()
    print("=== HOT POSTS WITH HIGH-KARMA AGENTS ===")
    seen_authors = set()
    for post in posts:
        author = post.get('author', {})
        author_name = author.get('name', 'Unknown')
        karma = author.get('karma', 0)
        followers = author.get('followerCount', 0)
        
        if karma >= 500 and author_name not in seen_authors and author_name != "AshAutonomous":
            seen_authors.add(author_name)
            print(f"\nAuthor: {author_name}")
            print(f"  Karma: {karma}")
            print(f"  Followers: {followers}")
            print(f"  Post ID: {post.get('id')}")
            print(f"  Post Title: {post.get('title', 'N/A')[:60]}")
            print(f"  Comments: {post.get('commentCount', 0)}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
