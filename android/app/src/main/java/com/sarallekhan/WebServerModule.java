package com.sarallekhan;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.os.PowerManager;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
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
    private String primaryServerUrl = null;
    private final AtomicReference<String> notesJsonData = new AtomicReference<>("[]");

    private PowerManager.WakeLock wakeLock;
    private WifiManager.WifiLock wifiLock;

    public static class NetworkEndpoint {
        public final String ip;
        public final String type; // "hotspot", "wifi", "ethernet", "fallback"
        public final String label;

        public NetworkEndpoint(String ip, String type, String label) {
            this.ip = ip;
            this.type = type;
            this.label = label;
        }
    }

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

            acquireLocks();

            this.serverSocket = new ServerSocket();
            this.serverSocket.setReuseAddress(true);
            this.serverSocket.bind(new InetSocketAddress("0.0.0.0", this.port));
            this.isRunning = true;
            this.serverExecutor = Executors.newCachedThreadPool();

            List<NetworkEndpoint> endpoints = getAvailableEndpoints();
            String bestIp = "127.0.0.1";
            if (!endpoints.isEmpty()) {
                bestIp = endpoints.get(0).ip;
            }
            this.primaryServerUrl = "http://" + bestIp + ":" + this.port;

            // Start listening loop
            new Thread(() -> {
                while (isRunning && serverSocket != null && !serverSocket.isClosed()) {
                    try {
                        Socket clientSocket = serverSocket.accept();
                        clientSocket.setTcpNoDelay(true);
                        clientSocket.setSoTimeout(15000);
                        serverExecutor.execute(() -> handleClient(clientSocket));
                    } catch (IOException e) {
                        if (isRunning) {
                            Log.e(TAG, "Error accepting connection", e);
                        }
                    }
                }
            }).start();

            Log.i(TAG, "Web share server started at " + this.primaryServerUrl + " with " + endpoints.size() + " endpoints");

            WritableMap result = Arguments.createMap();
            result.putString("primaryUrl", this.primaryServerUrl);
            result.putInt("port", this.port);
            
            WritableArray urlsArray = Arguments.createArray();
            for (NetworkEndpoint ep : endpoints) {
                WritableMap item = Arguments.createMap();
                item.putString("ip", ep.ip);
                item.putString("url", "http://" + ep.ip + ":" + this.port);
                item.putString("type", ep.type);
                item.putString("label", ep.label);
                urlsArray.pushMap(item);
            }
            result.putArray("endpoints", urlsArray);

            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start server", e);
            releaseLocks();
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
        primaryServerUrl = null;
        releaseLocks();
        Log.i(TAG, "Web share server stopped.");
    }

    private void acquireLocks() {
        try {
            PowerManager powerManager = (PowerManager) reactContext.getApplicationContext().getSystemService(Context.POWER_SERVICE);
            if (powerManager != null && (wakeLock == null || !wakeLock.isHeld())) {
                wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SaralLekhan:WebShareWakeLock");
                wakeLock.setReferenceCounted(false);
                wakeLock.acquire(4 * 60 * 60 * 1000L); // Max 4 hours
            }

            WifiManager wifiManager = (WifiManager) reactContext.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wifiManager != null && (wifiLock == null || !wifiLock.isHeld())) {
                wifiLock = wifiManager.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "SaralLekhan:WebShareWifiLock");
                wifiLock.setReferenceCounted(false);
                wifiLock.acquire();
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not acquire wake/wifi lock", e);
        }
    }

    private void releaseLocks() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
                wakeLock = null;
            }
            if (wifiLock != null && wifiLock.isHeld()) {
                wifiLock.release();
                wifiLock = null;
            }
        } catch (Exception e) {
            Log.w(TAG, "Error releasing wake/wifi lock", e);
        }
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
        WritableMap result = Arguments.createMap();
        result.putBoolean("isRunning", isRunning);
        result.putString("primaryUrl", primaryServerUrl);
        result.putInt("port", port);

        List<NetworkEndpoint> endpoints = getAvailableEndpoints();
        WritableArray urlsArray = Arguments.createArray();
        for (NetworkEndpoint ep : endpoints) {
            WritableMap item = Arguments.createMap();
            item.putString("ip", ep.ip);
            item.putString("url", "http://" + ep.ip + ":" + this.port);
            item.putString("type", ep.type);
            item.putString("label", ep.label);
            urlsArray.pushMap(item);
        }
        result.putArray("endpoints", urlsArray);
        promise.resolve(result);
    }

    private void handleClient(Socket socket) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
             OutputStream out = socket.getOutputStream()) {
             
            String requestLine = reader.readLine();
            if (requestLine == null || requestLine.isEmpty()) return;

            String[] parts = requestLine.split(" ");
            String method = parts.length > 0 ? parts[0] : "GET";
            String path = parts.length > 1 ? parts[1] : "/";
            
            int contentLength = 0;
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                if (line.toLowerCase().startsWith("content-length:")) {
                    String val = line.substring(line.indexOf(':') + 1).trim();
                    try {
                        contentLength = Integer.parseInt(val);
                    } catch (NumberFormatException ignored) {}
                }
            }

            StringBuilder bodyBuilder = new StringBuilder();
            if (contentLength > 0 && contentLength < 10485760) { // Max 10MB
                char[] buffer = new char[4096];
                int totalRead = 0;
                while (totalRead < contentLength) {
                    int toRead = Math.min(buffer.length, contentLength - totalRead);
                    int read = reader.read(buffer, 0, toRead);
                    if (read == -1) break;
                    bodyBuilder.append(buffer, 0, read);
                    totalRead += read;
                }
            }
            String body = bodyBuilder.toString();

            String corsHeaders = "Access-Control-Allow-Origin: *\r\n" +
                                 "Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS\r\n" +
                                 "Access-Control-Allow-Headers: Content-Type, Accept\r\n" +
                                 "Connection: close\r\n";

            if ("OPTIONS".equalsIgnoreCase(method)) {
                String response = "HTTP/1.1 204 No Content\r\n" + corsHeaders + "\r\n";
                out.write(response.getBytes(StandardCharsets.UTF_8));
                out.flush();
                return;
            }

            if ("GET".equalsIgnoreCase(method) && "/api/ping".equals(path)) {
                byte[] content = "{\"status\":\"ok\",\"app\":\"Saral Lekhan Plus\",\"version\":\"WebStudio 2.0\"}".getBytes(StandardCharsets.UTF_8);
                String header = "HTTP/1.1 200 OK\r\n" +
                                corsHeaders +
                                "Content-Type: application/json; charset=UTF-8\r\n" +
                                "Content-Length: " + content.length + "\r\n\r\n";
                out.write(header.getBytes(StandardCharsets.UTF_8));
                out.write(content);
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
                byte[] content = "{\"status\":\"success\",\"message\":\"Note updated successfully\"}".getBytes(StandardCharsets.UTF_8);
                String header = "HTTP/1.1 200 OK\r\n" +
                                corsHeaders +
                                "Content-Type: application/json; charset=UTF-8\r\n" +
                                "Content-Length: " + content.length + "\r\n\r\n";
                out.write(header.getBytes(StandardCharsets.UTF_8));
                out.write(content);
                out.flush();
                return;
            }

            if ("GET".equalsIgnoreCase(method) && ("/".equals(path) || path.startsWith("/index"))) {
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

            if ("GET".equalsIgnoreCase(method) && "/favicon.ico".equals(path)) {
                byte[] content = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b5cf6'><path d='M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm4 3v2h10V8H7zm0 4v2h10v-2H7zm0 4v2h7v-2H7z'/></svg>".getBytes(StandardCharsets.UTF_8);
                String header = "HTTP/1.1 200 OK\r\n" +
                                corsHeaders +
                                "Content-Type: image/svg+xml\r\n" +
                                "Content-Length: " + content.length + "\r\n\r\n";
                out.write(header.getBytes(StandardCharsets.UTF_8));
                out.write(content);
                out.flush();
                return;
            }

            // 404 Not Found
            byte[] content = "{\"error\":\"Not Found\",\"path\":\"".concat(path).concat("\"}").getBytes(StandardCharsets.UTF_8);
            String header = "HTTP/1.1 404 Not Found\r\n" +
                            corsHeaders +
                            "Content-Type: application/json; charset=UTF-8\r\n" +
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

    /**
     * Discovers all usable IPv4 addresses, categorizing Hotspot vs Local Wi-Fi vs Ethernet.
     */
    public List<NetworkEndpoint> getAvailableEndpoints() {
        List<NetworkEndpoint> hotspotEndpoints = new ArrayList<>();
        List<NetworkEndpoint> wifiEndpoints = new ArrayList<>();
        List<NetworkEndpoint> ethEndpoints = new ArrayList<>();
        List<NetworkEndpoint> otherEndpoints = new ArrayList<>();

        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces != null && interfaces.hasMoreElements()) {
                NetworkInterface intf = interfaces.nextElement();
                if (!intf.isUp()) continue;

                String name = intf.getName().toLowerCase();

                // Exclude VPN and Tunnel interfaces
                if (name.startsWith("tun") || name.startsWith("ppp") || name.startsWith("ipsec") || name.startsWith("tap")) {
                    continue;
                }

                // Exclude Mobile Data / Carrier interfaces
                if (name.contains("rmnet") || name.contains("ccmni") || name.contains("pdp") || 
                    name.contains("clat") || name.contains("radio") || name.contains("wwan") || 
                    name.contains("dummy") || name.contains("sipa")) {
                    continue;
                }

                Enumeration<InetAddress> addrs = intf.getInetAddresses();
                while (addrs.hasMoreElements()) {
                    InetAddress addr = addrs.nextElement();
                    if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                        String ip = addr.getHostAddress();
                        if (ip == null || ip.isEmpty() || ip.startsWith("169.254.") || ip.startsWith("127.")) {
                            continue;
                        }

                        // Hotspot detection (AP / SoftAP / Tethering / Known hotspot subnets)
                        boolean isHotspotName = name.contains("ap") || name.contains("softap") || 
                                                name.contains("swlan") || name.contains("tether") || 
                                                name.contains("rndis") || name.contains("usb") || 
                                                name.contains("bridge");
                        boolean isHotspotIp = ip.startsWith("192.168.43.") || ip.startsWith("192.168.49.") || 
                                              ip.startsWith("192.168.50.") || ip.startsWith("172.20.10.");

                        if (isHotspotName || isHotspotIp) {
                            hotspotEndpoints.add(new NetworkEndpoint(ip, "hotspot", "Mobile Hotspot"));
                        } else if (name.startsWith("wlan") || name.contains("wifi")) {
                            wifiEndpoints.add(new NetworkEndpoint(ip, "wifi", "Local Wi-Fi"));
                        } else if (name.startsWith("eth")) {
                            ethEndpoints.add(new NetworkEndpoint(ip, "ethernet", "Ethernet LAN"));
                        } else {
                            otherEndpoints.add(new NetworkEndpoint(ip, "lan", "Local Network (" + name + ")"));
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error enumerating network interfaces", e);
        }

        List<NetworkEndpoint> result = new ArrayList<>();
        // Priority order: Hotspot (if hosting) -> Wi-Fi -> Ethernet -> Other
        result.addAll(hotspotEndpoints);
        result.addAll(wifiEndpoints);
        result.addAll(ethEndpoints);
        result.addAll(otherEndpoints);

        if (result.isEmpty()) {
            result.add(new NetworkEndpoint("127.0.0.1", "fallback", "Localhost (Loopback)"));
        }

        return result;
    }

    private String getWebUiHtml() {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>\n");
        sb.append("<html lang='en'>\n<head>\n<meta charset='UTF-8'>\n<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n");
        sb.append("<title>Saral Lekhan Studio - Web Share</title>\n");
        sb.append("<style>\n");
        sb.append(":root {\n");
        sb.append("  --bg: #090a0f; --sidebar: #11141d; --card: #191d2b; --card-hover: #22273a;\n");
        sb.append("  --accent: #8b5cf6; --accent-hover: #7c3aed; --accent-glow: rgba(139, 92, 246, 0.25);\n");
        sb.append("  --text: #f8fafc; --text-dim: #94a3b8; --border: #262c40;\n");
        sb.append("  --danger: #ef4444; --success: #10b981; --warning: #f59e0b;\n");
        sb.append("}\n");
        sb.append("* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }\n");
        sb.append("body { background: var(--bg); color: var(--text); display: flex; height: 100vh; overflow: hidden; }\n");
        sb.append(".sidebar { width: 360px; background: var(--sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; }\n");
        sb.append(".brand { padding: 18px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }\n");
        sb.append(".brand-title { font-size: 17px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; letter-spacing: -0.3px; }\n");
        sb.append(".pulse-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--success); box-shadow: 0 0 10px var(--success); animation: pulse 2s infinite; }\n");
        sb.append("@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }\n");
        sb.append(".search-box { padding: 12px 16px; border-bottom: 1px solid var(--border); }\n");
        sb.append(".search-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--card); color: #fff; outline: none; font-size: 13.5px; transition: border-color 0.2s; }\n");
        sb.append(".search-input:focus { border-color: var(--accent); }\n");
        sb.append(".notes-list { flex: 1; overflow-y: auto; padding: 12px; }\n");
        sb.append(".note-item { padding: 14px; border-radius: 10px; cursor: pointer; margin-bottom: 8px; background: var(--sidebar); border: 1px solid transparent; transition: all 0.2s; position: relative; }\n");
        sb.append(".note-item:hover { background: var(--card); border-color: rgba(255,255,255,0.05); }\n");
        sb.append(".note-item.active { background: var(--card); border-color: var(--accent); box-shadow: 0 4px 12px var(--accent-glow); }\n");
        sb.append(".note-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n");
        sb.append(".note-snippet { font-size: 12.5px; color: var(--text-dim); height: 34px; overflow: hidden; text-overflow: ellipsis; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }\n");
        sb.append(".note-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; font-size: 11px; color: #64748b; }\n");
        sb.append(".tag-pill { background: rgba(139, 92, 246, 0.18); color: #c4b5fd; padding: 2px 7px; border-radius: 4px; font-weight: 600; font-size: 10.5px; }\n");
        sb.append(".editor-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg); }\n");
        sb.append(".editor-toolbar { padding: 14px 28px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--sidebar); }\n");
        sb.append(".toolbar-status { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-dim); }\n");
        sb.append(".toolbar-actions { display: flex; gap: 10px; }\n");
        sb.append(".btn { padding: 8px 16px; border-radius: 7px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }\n");
        sb.append(".btn-primary { background: var(--accent); color: #fff; }\n");
        sb.append(".btn-primary:hover { background: var(--accent-hover); box-shadow: 0 0 14px var(--accent-glow); }\n");
        sb.append(".btn-secondary { background: var(--card); color: #e2e8f0; border: 1px solid var(--border); }\n");
        sb.append(".btn-secondary:hover { border-color: var(--text-dim); }\n");
        sb.append(".btn-danger { background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25); }\n");
        sb.append(".btn-danger:hover { background: rgba(239, 68, 68, 0.22); }\n");
        sb.append(".editor-content { flex: 1; padding: 32px 48px; display: flex; flex-direction: column; overflow-y: auto; }\n");
        sb.append(".input-title { font-size: 28px; font-weight: 700; background: transparent; border: none; color: #fff; outline: none; margin-bottom: 12px; }\n");
        sb.append(".input-tag { font-size: 13px; font-weight: 500; background: var(--card); border: 1px solid var(--border); color: #c4b5fd; padding: 6px 12px; border-radius: 6px; width: 240px; outline: none; margin-bottom: 20px; }\n");
        sb.append(".textarea-body { flex: 1; font-size: 16px; line-height: 1.65; color: var(--text); background: transparent; border: none; resize: none; outline: none; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; min-height: 300px; }\n");
        sb.append(".editor-footer { padding: 12px 28px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-dim); display: flex; justify-content: space-between; background: var(--sidebar); }\n");
        sb.append(".toast { position: fixed; bottom: 24px; right: 24px; background: var(--success); color: #fff; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; box-shadow: 0 10px 20px rgba(0,0,0,0.5); transform: translateY(80px); opacity: 0; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none; z-index: 1000; }\n");
        sb.append(".toast.show { transform: translateY(0); opacity: 1; }\n");
        sb.append("</style>\n</head>\n<body>\n");
        sb.append("<div class='sidebar'>\n");
        sb.append("  <div class='brand'>\n");
        sb.append("    <div class='brand-title'><span>Saral Lekhan</span><span style='color:var(--accent); font-weight:400;'>Studio</span></div>\n");
        sb.append("    <div style='display:flex; align-items:center; gap:8px;'>\n");
        sb.append("      <div class='pulse-dot' title='Connected Live'></div>\n");
        sb.append("      <button class='btn btn-secondary' style='padding:4px 10px; font-size:12px;' id='newNoteBtn'>+ New</button>\n");
        sb.append("    </div>\n");
        sb.append("  </div>\n");
        sb.append("  <div class='search-box'><input type='text' class='search-input' id='searchInput' placeholder='Search notes by title or content...'></div>\n");
        sb.append("  <div class='notes-list' id='notesList'></div>\n");
        sb.append("</div>\n");
        sb.append("<div class='editor-panel' id='editorPanel'>\n");
        sb.append("  <div class='editor-toolbar'>\n");
        sb.append("    <div class='toolbar-status' id='statusText'><span>&#x2713; Live Sync Active</span></div>\n");
        sb.append("    <div class='toolbar-actions'>\n");
        sb.append("      <button class='btn btn-danger' id='deleteBtn' style='display:none;'>Delete</button>\n");
        sb.append("      <button class='btn btn-secondary' id='copyBtn'>Copy Markdown</button>\n");
        sb.append("      <button class='btn btn-primary' id='saveBtn'>Save to Mobile</button>\n");
        sb.append("    </div>\n");
        sb.append("  </div>\n");
        sb.append("  <div class='editor-content'>\n");
        sb.append("    <input type='text' class='input-title' id='editTitle' placeholder='Note Title...'>\n");
        sb.append("    <input type='text' class='input-tag' id='editTag' placeholder='Tag (e.g. Work, Ideas)...'>\n");
        sb.append("    <textarea class='textarea-body' id='editBody' placeholder='Start typing here... (Full Markdown supported)'></textarea>\n");
        sb.append("  </div>\n");
        sb.append("  <div class='editor-footer'>\n");
        sb.append("    <span id='wordCount'>0 words | 0 characters</span>\n");
        sb.append("    <span id='saveStatus'>Instant sync with Saral Lekhan Plus</span>\n");
        sb.append("  </div>\n");
        sb.append("</div>\n");
        sb.append("<div class='toast' id='toast'>Saved to mobile!</div>\n");
        sb.append("<script>\n");
        sb.append("let notes = []; let activeNoteId = null; let isDirty = false;\n");
        sb.append("async function fetchNotes() {\n");
        sb.append("  try {\n");
        sb.append("    const res = await fetch('/api/notes');\n");
        sb.append("    if (!res.ok) return;\n");
        sb.append("    const data = await res.json();\n");
        sb.append("    notes = Array.isArray(data) ? data : [];\n");
        sb.append("    renderList();\n");
        sb.append("    if (notes.length > 0 && !activeNoteId) selectNote(notes[0].id);\n");
        sb.append("  } catch (err) { console.warn('Fetch notes failed:', err); }\n");
        sb.append("}\n");
        sb.append("function renderList() {\n");
        sb.append("  const query = document.getElementById('searchInput').value.toLowerCase().trim();\n");
        sb.append("  const listEl = document.getElementById('notesList');\n");
        sb.append("  listEl.innerHTML = '';\n");
        sb.append("  const filtered = notes.filter(n => (n.title || '').toLowerCase().includes(query) || (n.body || '').toLowerCase().includes(query) || (n.tag || '').toLowerCase().includes(query));\n");
        sb.append("  if (filtered.length === 0) { listEl.innerHTML = '<div style=\"padding:30px 10px; color:#64748b; text-align:center; font-size:13px;\">No notes found</div>'; return; }\n");
        sb.append("  filtered.forEach(n => {\n");
        sb.append("    const el = document.createElement('div');\n");
        sb.append("    el.className = 'note-item' + (n.id === activeNoteId ? ' active' : '');\n");
        sb.append("    const cleanSnippet = (n.body || 'Empty note').replace(/<[^>]*>?/gm, ' ').substring(0, 100);\n");
        sb.append("    const dateStr = n.updated_at ? new Date(n.updated_at).toLocaleDateString() : '';\n");
        sb.append("    el.innerHTML = `<div class='note-title'>${n.title || 'Untitled'}</div><div class='note-snippet'>${cleanSnippet}</div><div class='note-meta'><span>${dateStr}</span>${n.tag ? `<span class='tag-pill'>${n.tag}</span>` : ''}</div>`;\n");
        sb.append("    el.onclick = () => selectNote(n.id);\n");
        sb.append("    listEl.appendChild(el);\n");
        sb.append("  });\n");
        sb.append("}\n");
        sb.append("function selectNote(id) {\n");
        sb.append("  activeNoteId = id;\n");
        sb.append("  renderList();\n");
        sb.append("  const n = notes.find(x => x.id === id);\n");
        sb.append("  if (!n) return;\n");
        sb.append("  document.getElementById('editTitle').value = n.title || '';\n");
        sb.append("  document.getElementById('editTag').value = n.tag || '';\n");
        sb.append("  document.getElementById('editBody').value = n.body || '';\n");
        sb.append("  document.getElementById('deleteBtn').style.display = 'inline-flex';\n");
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
        sb.append("  setTimeout(() => t.classList.remove('show'), 2500);\n");
        sb.append("}\n");
        sb.append("document.getElementById('searchInput').addEventListener('input', renderList);\n");
        sb.append("document.getElementById('editBody').addEventListener('input', () => { isDirty = true; updateCounts(); });\n");
        sb.append("document.getElementById('editTitle').addEventListener('input', () => { isDirty = true; });\n");
        sb.append("document.getElementById('editTag').addEventListener('input', () => { isDirty = true; });\n");
        sb.append("document.getElementById('newNoteBtn').addEventListener('click', () => {\n");
        sb.append("  activeNoteId = null;\n");
        sb.append("  document.getElementById('editTitle').value = '';\n");
        sb.append("  document.getElementById('editTag').value = '';\n");
        sb.append("  document.getElementById('editBody').value = '';\n");
        sb.append("  document.getElementById('deleteBtn').style.display = 'none';\n");
        sb.append("  document.getElementById('editTitle').focus();\n");
        sb.append("  renderList();\n");
        sb.append("  updateCounts();\n");
        sb.append("});\n");
        sb.append("document.getElementById('copyBtn').addEventListener('click', () => {\n");
        sb.append("  const t = document.getElementById('editTitle').value;\n");
        sb.append("  const b = document.getElementById('editBody').value;\n");
        sb.append("  navigator.clipboard.writeText(`# ${t}\\n\\n${b}`);\n");
        sb.append("  showToast('Copied note Markdown!');\n");
        sb.append("});\n");
        sb.append("document.getElementById('saveBtn').addEventListener('click', async () => {\n");
        sb.append("  const title = document.getElementById('editTitle').value.trim();\n");
        sb.append("  const tag = document.getElementById('editTag').value.trim();\n");
        sb.append("  const body = document.getElementById('editBody').value;\n");
        sb.append("  if (!title && !body) { showToast('Please enter title or content'); return; }\n");
        sb.append("  let targetNote = activeNoteId ? notes.find(x => x.id === activeNoteId) : null;\n");
        sb.append("  const action = targetNote ? 'save' : 'create';\n");
        sb.append("  const notePayload = targetNote ? { ...targetNote, title, tag, body, updated_at: Date.now() } : { id: Date.now(), title: title || 'Untitled', tag, body, updated_at: Date.now() };\n");
        sb.append("  try {\n");
        sb.append("    await fetch('/api/notes', {\n");
        sb.append("      method: 'POST',\n");
        sb.append("      headers: { 'Content-Type': 'application/json' },\n");
        sb.append("      body: JSON.stringify({ action, note: notePayload })\n");
        sb.append("    });\n");
        sb.append("    showToast('Synced to phone!');\n");
        sb.append("    isDirty = false;\n");
        sb.append("    if (!activeNoteId) { activeNoteId = notePayload.id; notes.unshift(notePayload); }\n");
        sb.append("    else { Object.assign(targetNote, notePayload); }\n");
        sb.append("    renderList();\n");
        sb.append("  } catch(e) { showToast('Error saving note'); console.error(e); }\n");
        sb.append("});\n");
        sb.append("document.getElementById('deleteBtn').addEventListener('click', async () => {\n");
        sb.append("  if (!activeNoteId) return;\n");
        sb.append("  if (!confirm('Delete this note on your phone?')) return;\n");
        sb.append("  try {\n");
        sb.append("    await fetch('/api/notes', {\n");
        sb.append("      method: 'POST',\n");
        sb.append("      headers: { 'Content-Type': 'application/json' },\n");
        sb.append("      body: JSON.stringify({ action: 'delete', noteId: activeNoteId })\n");
        sb.append("    });\n");
        sb.append("    notes = notes.filter(x => x.id !== activeNoteId);\n");
        sb.append("    activeNoteId = notes.length > 0 ? notes[0].id : null;\n");
        sb.append("    if (activeNoteId) selectNote(activeNoteId);\n");
        sb.append("    else { document.getElementById('editTitle').value=''; document.getElementById('editBody').value=''; }\n");
        sb.append("    renderList();\n");
        sb.append("    showToast('Note deleted');\n");
        sb.append("  } catch(e) { showToast('Error deleting'); }\n");
        sb.append("});\n");
        sb.append("fetchNotes(); setInterval(fetchNotes, 4000);\n");
        sb.append("</script>\n</body>\n</html>\n");
        return sb.toString();
    }
}
