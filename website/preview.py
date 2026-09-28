"""Local-only preview. Run: python -X utf8 preview.py [--port 18962]."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import socket

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=18962)
parser.add_argument('--release', action='store_true', help='Preview the publishable dist directory')
args = parser.parse_args()
directory = Path(__file__).resolve().parent / ('dist' if args.release else 'site')
if not (directory / 'index.html').exists():
    parser.error('Build the site before starting the preview.')
class PreviewServer(ThreadingHTTPServer):
    allow_reuse_address = False
    def server_bind(self):
        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()
server = PreviewServer(('127.0.0.1', args.port), partial(SimpleHTTPRequestHandler, directory=str(directory)))
print(f'Local preview: http://127.0.0.1:{args.port}/', flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
