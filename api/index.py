# -*- coding: utf-8 -*-
"""
Vercel serverless function wrapper for Flask
This file must be in api/ directory
"""
import sys
from pathlib import Path

# Add parent directory to path
parent = str(Path(__file__).parent.parent)
if parent not in sys.path:
    sys.path.insert(0, parent)

# Import Flask app
from app import app, init_db

# Initialize database
init_db()

# Vercel handler - receives request, returns response
def handler(request):
    """
    Vercel Python runtime handler
    
    Args:
        request: Vercel request object with method, url, headers, body
    
    Returns:
        dict with statusCode, headers, body
    """
    # Build WSGI environ from Vercel request
    url_parts = request.url.split('?', 1)
    path = url_parts[0]
    query = url_parts[1] if len(url_parts) > 1 else ''
    
    environ = {
        'REQUEST_METHOD': request.method,
        'PATH_INFO': path,
        'QUERY_STRING': query,
        'SERVER_NAME': 'localhost',
        'SERVER_PORT': '80',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': 'https',
        'wsgi.input': request.body if hasattr(request, 'body') else b'',
        'CONTENT_LENGTH': str(len(request.body)) if hasattr(request, 'body') else '0',
        'CONTENT_TYPE': request.headers.get('content-type', ''),
    }
    
    # Add HTTP headers
    for key, val in request.headers.items():
        env_key = 'HTTP_' + key.upper().replace('-', '_')
        environ[env_key] = val
    
    # Response
    status_code = [200]
    response_headers = []
    
    def start_response(status, headers):
        status_code[0] = int(status.split()[0])
        response_headers[:] = headers
    
    # Call Flask
    response_body = b''.join(app(environ, start_response))
    
    return {
        'statusCode': status_code[0],
        'headers': dict(response_headers),
        'body': response_body.decode('utf-8', errors='ignore')
    }
