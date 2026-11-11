# -*- coding: utf-8 -*-
"""
PaGamO Castle Conquest Tournament Server (中排灣語 總決賽 6人實戰連線伺服器)
Zero-dependency HTTP + Real-time Sync server using Python standard library.
"""

import http.server
import socketserver
import json
import socket
import os
import sys

PORT = 8080
EVENT_LOG = []
CLIENT_SEQ = 0

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

class TournamentRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/sync'):
            # Parse 'since' parameter
            since = 0
            if 'since=' in self.path:
                try:
                    since = int(self.path.split('since=')[1].split('&')[0])
                except Exception:
                    since = 0

            new_events = [e for e in EVENT_LOG if e['seq'] > since]
            resp_data = json.dumps(new_events).encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(resp_data)))
            self.end_headers()
            self.wfile.write(resp_data)
            return

        super().do_GET()

    def do_POST(self):
        global CLIENT_SEQ
        if self.path == '/api/sync':
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length)
            try:
                payload = json.loads(post_body.decode('utf-8'))
                CLIENT_SEQ += 1
                event = {
                    'seq': CLIENT_SEQ,
                    'senderId': payload.get('senderId', ''),
                    'data': payload.get('data', payload)
                }
                EVENT_LOG.append(event)
                # Keep last 500 events
                if len(EVENT_LOG) > 500:
                    del EVENT_LOG[:100]

                resp = json.dumps({'status': 'ok', 'seq': CLIENT_SEQ}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
            except Exception as e:
                self.send_response(400)
                self.end_headers()
            return

        super().do_POST()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    lan_ip = get_lan_ip()

    print("=" * 64)
    print("🏆 PaGamO 城堡爭奪戰 - 中排灣語總決賽 伺服器已啟動！")
    print(f"👉 本機遊玩網址:      http://localhost:{PORT}")
    print(f"👉 區域網路 6 人連線: http://{lan_ip}:{PORT}")
    print("=" * 64)
    print("💡 6 位選手可在各自的平板、筆電或手機瀏覽器開啟上方區域網路網址，")
    print("   各自登入「望嘉小尖兵」、「望嘉先鋒隊」、「望嘉勇士隊」、")
    print("   「族夢團」、「風那裡女團」、「戰鬥瘋隊」進行即時爭霸！")
    print("=" * 64)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), TournamentRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n伺服器已正常停止。")

if __name__ == '__main__':
    run_server()

