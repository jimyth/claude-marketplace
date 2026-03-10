#!/usr/bin/env python3
"""Simple local server for testing marketplace."""

import http.server
import socketserver
import json
import os
import yaml
import zipfile
import io

PORT = 3333
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class MarketplaceHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        # Remove query string for routing
        path = self.path.split('?')[0]

        # API endpoints
        if path == '/api/search':
            self.handle_search()
        elif path.startswith('/api/extensions/'):
            parts = path.replace('/api/extensions/', '').split('/')
            ext_id = parts[0]
            if len(parts) > 1 and parts[1] == 'download':
                self.handle_download(ext_id)
            else:
                self.handle_extension(ext_id)
        else:
            super().do_GET()

    def handle_search(self):
        """Handle search API."""
        try:
            # Reload index each time for development
            with open(os.path.join(BASE_DIR, 'index.yaml'), 'r') as f:
                index = yaml.safe_load(f)

            results = []
            for skill in index.get('skills', []):
                results.append({
                    **skill,
                    'source': 'public'
                })

            self.send_json({'results': results})

        except Exception as e:
            self.send_error(500, str(e))

    def handle_extension(self, ext_id):
        """Handle extension info API."""
        try:
            with open(os.path.join(BASE_DIR, 'index.yaml'), 'r') as f:
                index = yaml.safe_load(f)

            skill = next((s for s in index.get('skills', []) if s['id'] == ext_id), None)

            if not skill:
                self.send_error(404, 'Extension not found')
                return

            self.send_json({**skill, 'source': 'public'})

        except Exception as e:
            self.send_error(500, str(e))

    def handle_download(self, ext_id):
        """Handle extension download as ZIP."""
        try:
            with open(os.path.join(BASE_DIR, 'index.yaml'), 'r') as f:
                index = yaml.safe_load(f)

            skill = next((s for s in index.get('skills', []) if s['id'] == ext_id), None)

            if not skill:
                self.send_error(404, 'Extension not found')
                return

            skill_path = skill['path']
            skill_files = skill.get('files', ['SKILL.md'])

            # Create ZIP in memory
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
                skill_dir = os.path.join(BASE_DIR, skill_path)
                for filename in skill_files:
                    filepath = os.path.join(skill_dir, filename)
                    if os.path.exists(filepath):
                        with open(filepath, 'rb') as f:
                            zf.writestr(filename, f.read())

            zip_buffer.seek(0)

            self.send_response(200)
            self.send_header('Content-Type', 'application/zip')
            self.send_header('Content-Disposition', f'attachment; filename="{ext_id}.zip"')
            self.send_header('Content-Length', len(zip_buffer.getvalue()))
            self.end_headers()
            self.wfile.write(zip_buffer.read())

        except Exception as e:
            print(f"Download error: {e}")
            self.send_error(500, str(e))

    def send_json(self, data):
        """Send JSON response."""
        response = json.dumps(data).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(response))
        self.end_headers()
        self.wfile.write(response)

    def log_message(self, format, *args):
        print(f"[Marketplace] {args[0]}")


if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), MarketplaceHandler) as httpd:
        print(f"🏪 Marketplace server running at http://localhost:{PORT}")
        print(f"   API: http://localhost:{PORT}/api/search")
        print(f"   Press Ctrl+C to stop")
        httpd.serve_forever()
