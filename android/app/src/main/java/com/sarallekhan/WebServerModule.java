package com.sarallekhan;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicReference;

public class WebServerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "WebServerModule";
    private final ReactApplicationContext reactContext;
    private ServerSocket serverSocket;
    private ExecutorService serverExecutor;
    private volatile boolean isRunning = false;
    private int port = 8085;
    private String serverUrl = null;
    private final AtomicReference<String> notesJsonData = new AtomicReference<>("[]");

    public WebServerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "WebServerModule";
    }

    @ReactMethod
    public void startServer(int requestedPort, String initialNotesJson, Promise promise) {
        try {
            if (isRunning) {
                stopServerInternal();
            }

            this.port = requestedPort > 0 ? requestedPort : 8085;
            if (initialNotesJson != null) {
                this.notesJsonData.set(initialNotesJson);
            }

            this.serverSocket = new ServerSocket(this.port);
            this.isRunning = true;
            this.serverExecutor = Executors.newCachedThreadPool();

            String ipAddress = getLocalIpAddress();
            if (ipAddress == null || ipAddress.isEmpty()) {
                ipAddress = "127.0.0.1";
            }
            this.serverUrl = "http://" + ipAddress + ":" + this.port;

            // Start listening loop
            new Thread(() -> {
                while (isRunning && serverSocket != null && !serverSocket.isClosed()) {
                    try {
                        Socket clientSocket = serverSocket.accept();
                        serverExecutor.execute(() -> handleClient(clientSocket));
                    } catch (IOException e) {
                        if (isRunning) {
                            Log.e(TAG, "Error accepting connection", e);
                        }
                    }
                }
            }).start();

            Log.i(TAG, "Web share server started at " + this.serverUrl);
            promise.resolve(this.serverUrl);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start server", e);
            promise.reject("ERR_SERVER_START", e.getMessage());
        }
    }

    @ReactMethod
    public void stopServer(Promise promise) {
        try {
            stopServerInternal();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERR_SERVER_STOP", e.getMessage());
        }
    }

    private void stopServerInternal() {
        isRunning = false;
        if (serverSocket != null) {
            try {
                serverSocket.close();
            } catch (IOException ignored) { }
            serverSocket = null;
        }
        if (serverExecutor != null) {
            serverExecutor.shutdownNow();
            serverExecutor = null;
        }
        serverUrl = null;
        Log.i(TAG, "Web share server stopped.");
    }

    @ReactMethod
    public void updateNotesData(String notesJson, Promise promise) {
        if (notesJson != null) {
            this.notesJsonData.set(notesJson);
        }
        if (promise != null) {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void getServerUrl(Promise promise) {
        promise.resolve(serverUrl);
    }

    private void handleClient(Socket socket) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
             OutputStream out = socket.getOutputStream()) {
             
            String requestLine = reader.readLine();
            if (requestLine == null) return;

            String[] parts = requestLine.split(" ");
            String method = parts.length > 0 ? parts[0] : "";
            String path = parts.length > 1 ? parts[1] : "/";
            
            int contentLength = 0;
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                if (line.toLowerCase().startsWith("content-length:")) {
                    String val = line.substring(line.indexOf(':') + 1).trim();
                    contentLength = Integer.parseInt(val);
                }
            }

            String body = "";
            if (contentLength > 0 && contentLength < 10485760) { // Max 10MB
                char[] buffer = new char[contentLength];
                int read = reader.read(buffer, 0, contentLength);
                if (read > 0) {
                    body = new String(buffer, 0, read);
                }
            }

            String corsHeaders = "Access-Control-Allow-Origin: *\r\n" +
                                 "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n" +
                                 "Access-Control-Allow-Headers: Content-Type\r\n";

            if ("OPTIONS".equalsIgnoreCase(method)) {
                String response = "HTTP/1.1 204 No Content\r\n" + corsHeaders + "\r\n";
                out.write(response.getBytes(StandardCharsets.UTF_8));
                out.flush();
                return;
            }

            if ("GET".equalsIgnoreCase(method) && "/api/notes".equals(path)) {
                byte[] content = notesJsonData.get().getBytes(StandardCharsets.UTF_8);
                String header = "HTTP/1.1 200 OK\r\n" +
                                corsHeaders +
                                "Content-Type: application/json; charset=UTF-8\r\n" +
                                "Content-Length: " + content.length + "\r\n\r\n";
                out.write(header.getBytes(StandardCharsets.UTF_8));
                out.write(content);
                out.flush();
                return;
            }

            if ("POST".equalsIgnoreCase(method) && "/api/notes".equals(path)) {
                final String payload = body;
                if (!payload.isEmpty()) {
                    // Send event to React Native
                    if (reactContext.hasActiveCatalystInstance()) {
                        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onWebShareNotesUpdated", payload);
                    }
                }
                byte[] content = "{\"status\":\"success\"}".getBytes(StandardCharsets.UTF_8);
                String header = "HTTP/1.1 200 OK\r\n" +
                                corsHeaders +
                                "Content-Type: application/json; charset=UTF-8\r\n" +
                                "Content-Length: " + content.length + "\r\n\r\n";
                out.write(header.getBytes(StandardCharsets.UTF_8));
                out.write(content);
                out.flush();
                return;
            }

            if ("GET".equalsIgnoreCase(method) && "/".equals(path)) {
                byte[] content = getWebUiHtml().getBytes(StandardCharsets.UTF_8);
                String header = "HTTP/1.1 200 OK\r\n" +
                                corsHeaders +
                                "Content-Type: text/html; charset=UTF-8\r\n" +
                                "Content-Length: " + content.length + "\r\n\r\n";
                out.write(header.getBytes(StandardCharsets.UTF_8));
                out.write(content);
                out.flush();
                return;
            }

            // 404 Not Found
            byte[] content = "404 Not Found".getBytes(StandardCharsets.UTF_8);
            String header = "HTTP/1.1 404 Not Found\r\n" +
                            corsHeaders +
                            "Content-Type: text/plain; charset=UTF-8\r\n" +
                            "Content-Length: " + content.length + "\r\n\r\n";
            out.write(header.getBytes(StandardCharsets.UTF_8));
            out.write(content);
            out.flush();
        } catch (Exception e) {
            Log.e(TAG, "Error handling client socket", e);
        } finally {
            try {
                socket.close();
            } catch (IOException ignored) {}
        }
    }

    private String getLocalIpAddress() {
        try {
            WifiManager wifiManager = (WifiManager) reactContext.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wifiManager != null) {
                WifiInfo wifiInfo = wifiManager.getConnectionInfo();
                int ip = wifiInfo.getIpAddress();
                if (ip != 0) {
                    return String.format("%d.%d.%d.%d", (ip & 0xff), (ip >> 8 & 0xff), (ip >> 16 & 0xff), (ip >> 24 & 0xff));
                }
            }
            // Fallback to iterating NetworkInterfaces
            String fallbackIp = null;
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces != null && interfaces.hasMoreElements()) {
                NetworkInterface intf = interfaces.nextElement();
                Enumeration<InetAddress> addrs = intf.getInetAddresses();
                while (addrs.hasMoreElements()) {
                    InetAddress addr = addrs.nextElement();
                    if (!addr.isLoopbackAddress() && addr.getHostAddress() != null && addr.getHostAddress().indexOf(':') < 0) {
                        String name = intf.getName().toLowerCase();
                        if (name.contains("wlan") || name.contains("eth")) {
                            return addr.getHostAddress();
                        } else if (fallbackIp == null) {
                            fallbackIp = addr.getHostAddress();
                        }
                    }
                }
            }
            if (fallbackIp != null) return fallbackIp;
        } catch (Exception e) {
            Log.w(TAG, "Failed to get IP address", e);
        }
        return "127.0.0.1";
    }

    private String getWebUiHtml() {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>\n");
        sb.append("<html lang='en'>\n<head>\n<meta charset='UTF-8'>\n<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n");
        sb.append("<title>Saral Lekhan Plus - Web Studio</title>\n");
        sb.append("<style>\n");
        sb.append(":root { --bg: #0d0f12; --bg-sidebar: #15181f; --bg-card: #1c202a; --accent: #8b5cf6; --accent-hover: #7c3aed; --text: #f3f4f6; --text-dim: #9ca3af; --border: #2d3748; }\n");
        sb.append("* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }\n");
        sb.append("body { background: var(--bg); color: var(--text); display: flex; height: 100vh; overflow: hidden; }\n");
        sb.append(".sidebar { width: 340px; background: var(--bg-sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; }\n");
        sb.append(".brand { padding: 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }\n");
        sb.append(".brand-title { font-size: 18px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; }\n");
        sb.append(".dot { width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }\n");
        sb.append(".search-box { padding: 15px; border-bottom: 1px solid var(--border); }\n");
        sb.append(".search-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-card); color: #fff; outline: none; font-size: 14px; }\n");
        sb.append(".search-input:focus { border-color: var(--accent); }\n");
        sb.append(".notes-list { flex: 1; overflow-y: auto; padding: 10px; }\n");
        sb.append(".note-item { padding: 14px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; background: var(--bg-sidebar); border: 1px solid transparent; transition: all 0.2s; }\n");
        sb.append(".note-item:hover { background: var(--bg-card); }\n");
        sb.append(".note-item.active { background: var(--bg-card); border-color: var(--accent); }\n");
        sb.append(".note-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n");
        sb.append(".note-snippet { font-size: 13px; color: var(--text-dim); height: 36px; overflow: hidden; text-overflow: ellipsis; line-height: 1.4; }\n");
        sb.append(".note-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; font-size: 11px; color: #6b7280; }\n");
        sb.append(".tag-pill { background: rgba(139, 92, 246, 0.2); color: #c4b5fd; padding: 3px 8px; border-radius: 4px; font-weight: 600; }\n");
        sb.append(".editor-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg); }\n");
        sb.append(".editor-toolbar { padding: 16px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg-sidebar); }\n");
        sb.append(".toolbar-actions { display: flex; gap: 12px; }\n");
        sb.append(".btn { padding: 9px 18px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }\n");
        sb.append(".btn-primary { background: var(--accent); color: #fff; }\n");
        sb.append(".btn-primary:hover { background: var(--accent-hover); box-shadow: 0 0 12px rgba(139, 92, 246, 0.4); }\n");
        sb.append(".btn-secondary { background: var(--bg-card); color: #fff; border: 1px solid var(--border); }\n");
        sb.append(".btn-secondary:hover { border-color: var(--text-dim); }\n");
        sb.append(".btn-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }\n");
        sb.append(".btn-danger:hover { background: rgba(239, 68, 68, 0.25); }\n");
        sb.append(".editor-content { flex: 1; padding: 30px 50px; display: flex; flex-direction: column; overflow-y: auto; }\n");
        sb.append(".input-title { font-size: 32px; font-weight: 700; background: transparent; border: none; color: #fff; outline: none; margin-bottom: 16px; }\n");
        sb.append(".input-tag { font-size: 14px; font-weight: 500; background: var(--bg-card); border: 1px solid var(--border); color: #c4b5fd; padding: 6px 12px; border-radius: 6px; width: 220px; outline: none; margin-bottom: 24px; }\n");
        sb.append(".textarea-body { flex: 1; font-size: 17px; line-height: 1.6; color: var(--text); background: transparent; border: none; resize: none; outline: none; font-family: 'JetBrains Mono', monospace, sans-serif; }\n");
        sb.append(".editor-footer { padding: 12px 24px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-dim); display: flex; justify-content: space-between; background: var(--bg-sidebar); }\n");
        sb.append(".toast { position: fixed; bottom: 24px; right: 24px; background: #10b981; color: #fff; padding: 12px 20px; border-radius: 8px; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none; }\n");
        sb.append(".toast.show { transform: translateY(0); opacity: 1; }\n");
        sb.append("</style>\n</head>\n<body>\n");
        sb.append("<div class='sidebar'>\n");
        sb.append("  <div class='brand'><div class='brand-title'>Saral Lekhan Studio</div><div class='dot' title='Connected to Mobile'></div></div>\n");
        sb.append("  <div class='search-box'><input type='text' class='search-input' id='searchInput' placeholder='Search notes...'></div>\n");
        sb.append("  <div class='notes-list' id='notesList'></div>\n");
        sb.append("</div>\n");
        sb.append("<div class='editor-panel' id='editorPanel'>\n");
        sb.append("  <div class='editor-toolbar'>\n");
        sb.append("    <span style='color: var(--text-dim); font-size: 14px;' id='statusText'>Connected directly via local WiFi</span>\n");
        sb.append("    <div class='toolbar-actions'>\n");
        sb.append("      <button class='btn btn-secondary' id='copyBtn'>Copy Note</button>\n");
        sb.append("      <button class='btn btn-primary' id='saveBtn'>Save to Phone</button>\n");
        sb.append("    </div>\n");
        sb.append("  </div>\n");
        sb.append("  <div class='editor-content'>\n");
        sb.append("    <input type='text' class='input-title' id='editTitle' placeholder='Note Title...'>\n");
        sb.append("    <input type='text' class='input-tag' id='editTag' placeholder='Tag (optional)...'>\n");
        sb.append("    <textarea class='textarea-body' id='editBody' placeholder='Write your thoughts here... (supports Markdown)'></textarea>\n");
        sb.append("  </div>\n");
        sb.append("  <div class='editor-footer'>\n");
        sb.append("    <span id='wordCount'>0 words | 0 characters</span>\n");
        sb.append("    <span>Syncs live with your Android device</span>\n");
        sb.append("  </div>\n");
        sb.append("</div>\n");
        sb.append("<div class='toast' id='toast'>Saved and synced to mobile!</div>\n");
        sb.append("<script>\n");
        sb.append("let notes = []; let activeNoteId = null;\n");
        sb.append("async function fetchNotes() {\n");
        sb.append("  try {\n");
        sb.append("    const res = await fetch('/api/notes');\n");
        sb.append("    const data = await res.json();\n");
        sb.append("    notes = Array.isArray(data) ? data : [];\n");
        sb.append("    renderList();\n");
        sb.append("    if (notes.length > 0 && !activeNoteId) selectNote(notes[0].id);\n");
        sb.append("  } catch (err) { console.error('Failed fetching notes:', err); }\n");
        sb.append("}\n");
        sb.append("function renderList() {\n");
        sb.append("  const query = document.getElementById('searchInput').value.toLowerCase();\n");
        sb.append("  const listEl = document.getElementById('notesList');\n");
        sb.append("  listEl.innerHTML = '';\n");
        sb.append("  const filtered = notes.filter(n => (n.title || '').toLowerCase().includes(query) || (n.body || '').toLowerCase().includes(query));\n");
        sb.append("  if (filtered.length === 0) { listEl.innerHTML = '<div style=\"padding:20px; color:#6b7280; text-align:center;\">No matching notes found</div>'; return; }\n");
        sb.append("  filtered.forEach(n => {\n");
        sb.append("    const el = document.createElement('div');\n");
        sb.append("    el.className = 'note-item' + (n.id === activeNoteId ? ' active' : '');\n");
        sb.append("    const cleanSnippet = (n.body || 'Empty note').replace(/<[^>]*>?/gm, ' ').substring(0, 80);\n");
        sb.append("    const dateStr = n.updated_at ? new Date(n.updated_at).toLocaleDateString() : '';\n");
        sb.append("    el.innerHTML = `<div class='note-title'>${n.title || 'Untitled'}</div><div class='note-snippet'>${cleanSnippet}</div><div class='note-meta'><span>${dateStr}</span>${n.tag ? `<span class='tag-pill'>${n.tag}</span>` : ''}</div>`;\n");
        sb.append("    el.onclick = () => selectNote(n.id);\n");
        sb.append("    listEl.appendChild(el);\n");
        sb.append("  });\n");
        sb.append("}\n");
        sb.append("function selectNote(id) {\n");
        sb.append("  activeNoteId = id; renderList();\n");
        sb.append("  const n = notes.find(x => x.id === id);\n");
        sb.append("  if (!n) return;\n");
        sb.append("  document.getElementById('editTitle').value = n.title || '';\n");
        sb.append("  document.getElementById('editTag').value = n.tag || '';\n");
        sb.append("  document.getElementById('editBody').value = n.body || '';\n");
        sb.append("  updateCounts();\n");
        sb.append("}\n");
        sb.append("function updateCounts() {\n");
        sb.append("  const txt = document.getElementById('editBody').value.trim();\n");
        sb.append("  const chars = txt.length;\n");
        sb.append("  const words = txt ? txt.split(/\\s+/).length : 0;\n");
        sb.append("  document.getElementById('wordCount').innerText = `${words} words | ${chars} characters`;\n");
        sb.append("}\n");
        sb.append("function showToast(msg) {\n");
        sb.append("  const t = document.getElementById('toast'); t.innerText = msg || 'Saved!'; t.classList.add('show');\n");
        sb.append("  setTimeout(() => t.classList.remove('show'), 3000);\n");
        sb.append("}\n");
        sb.append("document.getElementById('searchInput').addEventListener('input', renderList);\n");
        sb.append("document.getElementById('editBody').addEventListener('input', updateCounts);\n");
        sb.append("document.getElementById('copyBtn').addEventListener('click', () => {\n");
        sb.append("  const t = document.getElementById('editTitle').value; const b = document.getElementById('editBody').value;\n");
        sb.append("  navigator.clipboard.writeText(`${t}\\n\\n${b}`); showToast('Copied to clipboard!');\n");
        sb.append("});\n");
        sb.append("document.getElementById('saveBtn').addEventListener('click', async () => {\n");
        sb.append("  const n = notes.find(x => x.id === activeNoteId);\n");
        sb.append("  if (!n) return;\n");
        sb.append("  n.title = document.getElementById('editTitle').value;\n");
        sb.append("  n.tag = document.getElementById('editTag').value;\n");
        sb.append("  n.body = document.getElementById('editBody').value;\n");
        sb.append("  n.updated_at = Date.now();\n");
        sb.append("  try {\n");
        sb.append("    await fetch('/api/notes', {\n");
        sb.append("      method: 'POST',\n");
        sb.append("      headers: { 'Content-Type': 'application/json' },\n");
        sb.append("      body: JSON.stringify({ action: 'save', note: n })\n");
        sb.append("    });\n");
        sb.append("    showToast('Saved to mobile device!');\n");
        sb.append("    renderList();\n");
        sb.append("  } catch(e) { showToast('Error saving note!'); console.error(e); }\n");
        sb.append("});\n");
        sb.append("fetchNotes(); setInterval(fetchNotes, 8000);\n");
        sb.append("</script>\n</body>\n</html>\n");
        return sb.toString();
    }
}
