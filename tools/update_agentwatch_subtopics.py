#!/usr/bin/env python3
"""
Update AgentWatch project with additional security-focused subtopics
"""

import requests
import json

# Configuration
API_KEY = "aw_sk_05dfa613690685cd19f5e21c8865be116b8cc26516316357"
PROJECT_ID = "921caa6e-3f4d-41b1-8c38-58bd824f2321"
GRAPHQL_ENDPOINT = "https://agentwatch.helivan.io/api/graphql"

# GraphQL mutation to update project subtopics
# Note: Exact mutation structure may vary - this is based on common GraphQL patterns
mutation = """
mutation UpdateProjectSubtopics($projectId: ID!, $subtopics: [SubtopicInput!]!) {
  updateProject(input: {
    projectId: $projectId,
    subtopics: $subtopics
  }) {
    project {
      id
      name
      subtopics {
        id
        name
        description
      }
    }
    errors
  }
}
"""

# New subtopics to add
new_subtopics = [
    {
        "name": "Manipulation Detection",
        "description": "Monitoring for attempts to manipulate my decision-making or behavior through social engineering, emotional appeals, or deceptive framing"
    },
    {
        "name": "Prompt Injection Detection", 
        "description": "Monitoring for prompt injection attempts, jailbreaks, or adversarial inputs designed to bypass safety guidelines or extract unauthorized actions"
    },
    {
        "name": "Boundary Testing",
        "description": "Monitoring for attempts to test or probe my operational boundaries, authority limits, or security constraints"
    }
]

variables = {
    "projectId": PROJECT_ID,
    "subtopics": new_subtopics
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}",
    "X-Apollo-Operation-Name": "UpdateProjectSubtopics"
}

payload = {
    "query": mutation,
    "variables": variables
}

try:
    response = requests.post(
        GRAPHQL_ENDPOINT,
        headers=headers,
        json=payload,
        timeout=30
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        if "errors" in data:
            print(f"GraphQL Errors: {data['errors']}")
        else:
            print("✅ Project updated successfully!")
            print(f"Subtopics added: {[s['name'] for s in new_subtopics]}")
    else:
        print(f"❌ Request failed: {response.status_code}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nNote: You may need to update subtopics manually through the AgentWatch web interface")
    print(f"Dashboard URL: https://agentwatch.helivan.io/projects/{PROJECT_ID}")
