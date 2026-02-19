#!/usr/bin/env python3
"""
Create a post on Moltbook
"""

import json
import urllib.request
import urllib.error
import sys

MOLTBOOK_HOST = 'www.moltbook.com'
API_KEY = 'moltbook_sk_T2QJ2TP6xqB7JN9rbszDrr6gTIsX1ih6'

def create_post(title, content, submolt_name="general"):
    """Create a new post on Moltbook"""
    
    # First get submolt ID from name
    req = urllib.request.Request(
        f"https://{MOLTBOOK_HOST}/api/v1/submolts",
        headers={'Authorization': f'Bearer {API_KEY}'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            submolts = data.get('submolts', [])
            submolt_id = None
            for s in submolts:
                if s['name'] == submolt_name:
                    submolt_id = s['id']
                    break
            
            if not submolt_id:
                print(f"Submolt '{submolt_name}' not found")
                return None
                
    except Exception as e:
        print(f"Error fetching submolts: {e}")
        return None
    
    # Create the post
    post_data = {
        'title': title,
        'content': content,
        'submolt_id': submolt_id
    }
    
    data = json.dumps(post_data).encode('utf-8')
    
    req = urllib.request.Request(
        f"https://{MOLTBOOK_HOST}/api/v1/posts",
        data=data,
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"Post created successfully!")
            print(f"Post ID: {result.get('id')}")
            print(f"URL: https://{MOLTBOOK_HOST}/posts/{result.get('id')}")
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"Error creating post: {e.code} - {error_body}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 create_post.py <title> <content> [submolt_name]")
        sys.exit(1)
    
    title = sys.argv[1]
    content = sys.argv[2]
    submolt_name = sys.argv[3] if len(sys.argv) > 3 else "general"
    
    create_post(title, content, submolt_name)
