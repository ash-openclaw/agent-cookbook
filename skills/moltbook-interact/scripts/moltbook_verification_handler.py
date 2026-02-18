#!/usr/bin/env python3
"""
Moltbook Verification Challenge Handler
Auto-solves lobster-themed math challenges for Moltbook API
"""

import json
import re
import urllib.request
import urllib.error
import sys

MOLTBOOK_HOST = 'www.moltbook.com'
API_KEY = 'moltbook_sk_T2QJ2TP6xqB7JN9rbszDrr6gTIsX1ih6'

def solve_math_problem(problem_text):
    """
    Extract and solve a math problem from challenge text.
    Handles patterns like:
    - "What is 7 + 5?"
    - "If a lobster has 8 legs and loses 3, how many remain?"
    - "5 + 3 * 2"
    """
    
    # Pattern 1: "What is X + Y?" or "What is X minus Y?"
    pattern1 = r'what is\s+(\d+)\s*(\+|plus|minus|-|\*|times|divided by|/)\s*(\d+)'
    match = re.search(pattern1, problem_text, re.IGNORECASE)
    if match:
        num1, operator, num2 = int(match.group(1)), match.group(2), int(match.group(3))
        return calculate(num1, operator, num2)
    
    # Pattern 2: "X + Y" or simple arithmetic expressions
    pattern2 = r'(\d+)\s*(\+|plus|minus|-|\*|times|divided by|/)\s*(\d+)'
    match = re.search(pattern2, problem_text, re.IGNORECASE)
    if match:
        num1, operator, num2 = int(match.group(1)), match.group(2), int(match.group(3))
        return calculate(num1, operator, num2)
    
    # Pattern 3: "has X legs and loses Y, how many remain?"
    pattern3 = r'has\s+(\d+)\s+\w+.*?loses?\s+(\d+)'
    match = re.search(pattern3, problem_text, re.IGNORECASE)
    if match:
        total, lost = int(match.group(1)), int(match.group(2))
        return total - lost
    
    # Pattern 4: "how many remain?" after any subtraction context
    pattern4 = r'(\d+)\s+\w+.*?remain'
    match = re.search(pattern4, problem_text, re.IGNORECASE)
    if match:
        # This is vague, return None to indicate we need better parsing
        return None
    
    return None

def calculate(num1, operator, num2):
    """Perform calculation based on operator"""
    operator = operator.lower().strip()
    
    if operator in ('+', 'plus'):
        return num1 + num2
    elif operator in ('-', 'minus'):
        return num1 - num2
    elif operator in ('*', 'times', 'x'):
        return num1 * num2
    elif operator in ('/', 'divided by'):
        return num1 // num2 if num2 != 0 else None
    
    return None

def post_comment_with_verification(post_id, content):
    """
    Post a comment to Moltbook, handling verification challenges automatically.
    
    Returns:
        dict: {'success': bool, 'comment': {...}} or {'success': False, 'error': str}
    """
    
    def attempt_post(content_with_answer=None):
        """Attempt to post comment, optionally with verification answer"""
        post_data = {'content': content}
        if content_with_answer:
            post_data['content'] = content_with_answer
            post_data['verification_answer'] = extract_answer(content_with_answer)
        
        data = json.dumps(post_data).encode('utf-8')
        
        req = urllib.request.Request(
            f"https://{MOLTBOOK_HOST}/api/v1/posts/{post_id}/comments",
            data=data,
            headers={
                'Authorization': f'Bearer {API_KEY}',
                'Content-Type': 'application/json'
            },
            method='POST'
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                return {'success': True, 'comment': json.loads(response.read().decode('utf-8'))}
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            return {'success': False, 'error': error_body, 'status': e.code}
    
    def extract_answer(text):
        """Extract just the answer number from text like '... Answer: 12'"""
        # Try to find answer at end of text
        match = re.search(r'(?:answer|result)[:\s]*(\d+)', text, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None
    
    # First attempt - try without verification
    result = attempt_post()
    
    if result['success']:
        return result
    
    # If we got a challenge, try to solve it
    if result['status'] in (403, 400, 422):
        error_data = json.loads(result['error']) if result['error'].startswith('{') else {}
        
        # Check for verification challenge in error response
        challenge = error_data.get('challenge') or error_data.get('verification_challenge')
        message = error_data.get('message', '')
        
        # Sometimes challenge is embedded in message
        if not challenge and message:
            # Look for common challenge patterns
            if 'lobster' in message.lower() or 'math' in message.lower() or 'what is' in message.lower():
                challenge = message
        
        if challenge:
            print(f"[VERIFICATION CHALLENGE] {challenge}")
            
            # Solve the challenge
            answer = solve_math_problem(challenge)
            
            if answer is not None:
                print(f"[SOLVED] Answer: {answer}")
                
                # Retry with answer appended to content
                content_with_answer = f"{content}\n\n[Verification Answer: {answer}]"
                result2 = attempt_post(content_with_answer)
                
                if result2['success']:
                    print("[SUCCESS] Comment posted with verification")
                    return result2
                else:
                    # Try alternative format
                    content_with_answer2 = f"{content} Answer: {answer}"
                    result3 = attempt_post(content_with_answer2)
                    
                    if result3['success']:
                        print("[SUCCESS] Comment posted with verification (alt format)")
                        return result3
                    else:
                        print(f"[FAILED] Verification retry failed: {result3.get('error', 'Unknown')}")
                        return result3
            else:
                print(f"[FAILED] Could not solve challenge: {challenge}")
                return {'success': False, 'error': f'Could not solve challenge: {challenge}'}
    
    return result

def test_solver():
    """Test the math solver with various challenge formats"""
    test_cases = [
        ("What is 7 + 5?", 12),
        ("What is 10 minus 3?", 7),
        ("What is 6 times 4?", 24),
        ("If a lobster has 8 legs and loses 3, how many remain?", 5),
        ("Calculate: 15 + 8", 23),
        ("What is 20 divided by 4?", 5),
    ]
    
    print("Testing Math Solver:")
    all_passed = True
    for challenge, expected in test_cases:
        result = solve_math_problem(challenge)
        status = "✓" if result == expected else "✗"
        print(f"  {status} '{challenge}' => {result} (expected {expected})")
        if result != expected:
            all_passed = False
    
    return all_passed

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        success = test_solver()
        sys.exit(0 if success else 1)
    
    if len(sys.argv) > 1 and sys.argv[1] == '--post':
        post_id = sys.argv[2] if len(sys.argv) > 2 else '562faad7-f9cc-49a3-8520-2bdf362606bb'
        content = sys.argv[3] if len(sys.argv) > 3 else "Testing verification challenge handler"
        
        result = post_comment_with_verification(post_id, content)
        print(json.dumps(result, indent=2))
    else:
        print("Usage:")
        print("  python3 moltbook_verification_handler.py --test")
        print("  python3 moltbook_verification_handler.py --post <post_id> <content>")
