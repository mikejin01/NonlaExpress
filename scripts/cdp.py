"""Minimal Chrome DevTools Protocol client (stdlib only) — scroll, screenshot, evaluate JS."""
import base64, json, os, socket, struct, subprocess, time, urllib.request

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT = 9333


class WS:
    def __init__(self, url):
        _, rest = url.split("://", 1)
        hostport, path = rest.split("/", 1)
        host, port = hostport.split(":")
        self.s = socket.create_connection((host, int(port)), timeout=30)
        key = base64.b64encode(os.urandom(16)).decode()
        req = (
            f"GET /{path} HTTP/1.1\r\nHost: {hostport}\r\nUpgrade: websocket\r\n"
            f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
        )
        self.s.sendall(req.encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            buf += self.s.recv(4096)
        self.buf = buf.split(b"\r\n\r\n", 1)[1]

    def _recv(self, n):
        while len(self.buf) < n:
            chunk = self.s.recv(65536)
            if not chunk:
                raise EOFError
            self.buf += chunk
        out, self.buf = self.buf[:n], self.buf[n:]
        return out

    def send(self, obj):
        data = json.dumps(obj).encode()
        hdr = b"\x81"
        n = len(data)
        if n < 126:
            hdr += struct.pack("!B", n | 0x80)
        elif n < 65536:
            hdr += struct.pack("!BH", 126 | 0x80, n)
        else:
            hdr += struct.pack("!BQ", 127 | 0x80, n)
        mask = os.urandom(4)
        masked = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
        self.s.sendall(hdr + mask + masked)

    def recv(self):
        b0, b1 = self._recv(2)
        ln = b1 & 0x7F
        if ln == 126:
            ln = struct.unpack("!H", self._recv(2))[0]
        elif ln == 127:
            ln = struct.unpack("!Q", self._recv(8))[0]
        return json.loads(self._recv(ln).decode())


class Chrome:
    def __init__(self, width=1440, height=800):
        self.proc = subprocess.Popen(
            [CHROME, "--headless=new", f"--remote-debugging-port={PORT}", "--disable-gpu",
             "--hide-scrollbars", "--no-first-run", f"--window-size={width},{height}",
             "--user-data-dir=/tmp/cdp-profile", "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(80):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json"))
                page = [t for t in tabs if t["type"] == "page"][0]
                self.ws = WS(page["webSocketDebuggerUrl"])
                break
            except Exception:
                time.sleep(0.4)
        else:
            raise RuntimeError("chrome did not start")
        self.mid = 0

    def cmd(self, method, **params):
        self.mid += 1
        self.ws.send({"id": self.mid, "method": method, "params": params})
        while True:
            msg = self.ws.recv()
            if msg.get("id") == self.mid:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg.get("result", {})

    def goto(self, url, wait=12):
        self.cmd("Page.enable")
        self.cmd("Page.navigate", url=url)
        time.sleep(wait)

    def js(self, expr):
        r = self.cmd("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
        return r.get("result", {}).get("value")

    def shot(self, path):
        r = self.cmd("Page.captureScreenshot", format="png")
        open(path, "wb").write(base64.b64decode(r["data"]))

    def close(self):
        try:
            self.proc.terminate()
        except Exception:
            pass
