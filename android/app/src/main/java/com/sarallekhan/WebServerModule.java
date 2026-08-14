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
                byte[] content = "{\"status\":\"success\",\"message\":\"Note action processed\"}".getBytes(StandardCharsets.UTF_8);
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
        sb.append("  --bg: #090b10; --sidebar: #10141f; --sidebar-active: #181e2e; --card: #151a28; --card-hover: #1e2438;\n");
        sb.append("  --accent: #8b5cf6; --accent-hover: #7c3aed; --accent-glow: rgba(139, 92, 246, 0.25);\n");
        sb.append("  --text: #f8fafc; --text-dim: #94a3b8; --border: #232a3f; --border-focus: #4f46e5;\n");
        sb.append("  --danger: #ef4444; --danger-bg: rgba(239, 68, 68, 0.14); --success: #10b981; --warning: #f59e0b;\n");
        sb.append("}\n");
        sb.append("* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif; }\n");
        sb.append("body { background: var(--bg); color: var(--text); display: flex; height: 100vh; overflow: hidden; }\n");
        
        // Navigation sidebar
        sb.append(".sidebar { width: 340px; background: var(--sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; }\n");
        sb.append(".brand { padding: 16px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }\n");
        sb.append(".brand-title { font-size: 16px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }\n");
        sb.append(".pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 8px var(--success); animation: pulse 2s infinite; }\n");
        sb.append("@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }\n");
        
        // Tabs (All, Pinned, Trash)
        sb.append(".nav-tabs { display: flex; padding: 8px 12px; gap: 6px; border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.15); }\n");
        sb.append(".nav-tab { flex: 1; padding: 7px 4px; border-radius: 6px; border: none; background: transparent; color: var(--text-dim); font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.15s; }\n");
        sb.append(".nav-tab:hover { background: var(--sidebar-active); color: #fff; }\n");
        sb.append(".nav-tab.active { background: var(--card); color: var(--accent); border: 1px solid var(--border); }\n");
        sb.append(".badge { font-size: 10px; background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 99px; color: var(--text-dim); }\n");
        sb.append(".nav-tab.active .badge { background: var(--accent); color: #fff; }\n");
        
        // Search & Tags
        sb.append(".search-box { padding: 10px 14px; border-bottom: 1px solid var(--border); }\n");
        sb.append(".search-input { width: 100%; padding: 8px 12px; border-radius: 7px; border: 1px solid var(--border); background: var(--card); color: #fff; outline: none; font-size: 13px; }\n");
        sb.append(".search-input:focus { border-color: var(--accent); }\n");
        sb.append(".tag-rail { display: flex; gap: 6px; overflow-x: auto; padding: 8px 14px; border-bottom: 1px solid var(--border); scrollbar-width: none; }\n");
        sb.append(".tag-rail::-webkit-scrollbar { display: none; }\n");
        sb.append(".filter-tag { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: var(--card); color: var(--text-dim); border: 1px solid var(--border); cursor: pointer; white-space: nowrap; transition: all 0.15s; }\n");
        sb.append(".filter-tag:hover { color: #fff; border-color: var(--accent); }\n");
        sb.append(".filter-tag.active { background: var(--accent); color: #fff; border-color: var(--accent); }\n");

        // Notes List
        sb.append(".notes-list { flex: 1; overflow-y: auto; padding: 10px; }\n");
        sb.append(".note-item { padding: 12px 14px; border-radius: 9px; cursor: pointer; margin-bottom: 6px; background: var(--sidebar); border: 1px solid transparent; transition: all 0.15s; position: relative; }\n");
        sb.append(".note-item:hover { background: var(--card); border-color: rgba(255,255,255,0.05); }\n");
        sb.append(".note-item.active { background: var(--card); border-color: var(--accent); box-shadow: 0 3px 10px var(--accent-glow); }\n");
        sb.append(".note-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; justify-content: space-between; }\n");
        sb.append(".pin-icon { color: var(--warning); font-size: 11px; margin-left: 4px; }\n");
        sb.append(".note-snippet { font-size: 12px; color: var(--text-dim); height: 32px; overflow: hidden; text-overflow: ellipsis; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }\n");
        sb.append(".note-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; font-size: 10.5px; color: #64748b; }\n");
        sb.append(".tag-pill { background: rgba(139, 92, 246, 0.16); color: #c4b5fd; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 10px; }\n");

        // Trash action banner in list
        sb.append(".trash-header { padding: 8px 12px; background: var(--danger-bg); border-bottom: 1px solid rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; color: #fca5a5; }\n");
        sb.append(".trash-empty-btn { background: transparent; border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; }\n");
        sb.append(".trash-empty-btn:hover { background: var(--danger); color: #fff; }\n");

        // Editor Panel
        sb.append(".editor-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg); }\n");
        sb.append(".editor-header { padding: 12px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--sidebar); }\n");
        sb.append(".sync-status { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-dim); }\n");
        sb.append(".sync-status.saved { color: var(--success); }\n");
        sb.append(".header-actions { display: flex; gap: 8px; }\n");
        sb.append(".btn { padding: 7px 14px; border-radius: 6px; border: none; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 5px; }\n");
        sb.append(".btn-primary { background: var(--accent); color: #fff; }\n");
        sb.append(".btn-primary:hover { background: var(--accent-hover); box-shadow: 0 0 12px var(--accent-glow); }\n");
        sb.append(".btn-secondary { background: var(--card); color: #e2e8f0; border: 1px solid var(--border); }\n");
        sb.append(".btn-secondary:hover { border-color: var(--text-dim); }\n");
        sb.append(".btn-danger { background: var(--danger-bg); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }\n");
        sb.append(".btn-danger:hover { background: var(--danger); color: #fff; }\n");
        sb.append(".btn-success { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }\n");
        sb.append(".btn-success:hover { background: var(--success); color: #fff; }\n");

        // Rich text toolbar
        sb.append(".styling-toolbar { padding: 8px 24px; background: #0e111a; border-bottom: 1px solid var(--border); display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }\n");
        sb.append(".tool-btn { background: transparent; border: 1px solid transparent; color: #cbd5e1; border-radius: 4px; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.1s; }\n");
        sb.append(".tool-btn:hover { background: var(--card); color: #fff; border-color: var(--border); }\n");
        sb.append(".tool-btn.active { background: var(--accent); color: #fff; }\n");
        sb.append(".tool-divider { width: 1px; height: 18px; background: var(--border); margin: 0 4px; }\n");
        sb.append(".tool-select { background: var(--card); color: #cbd5e1; border: 1px solid var(--border); border-radius: 4px; padding: 4px 8px; font-size: 12px; outline: none; cursor: pointer; }\n");
        sb.append(".view-mode-toggle { margin-left: auto; display: flex; gap: 4px; }\n");

        // Editor Body & contenteditable
        sb.append(".editor-scroll { flex: 1; overflow-y: auto; padding: 24px 44px; display: flex; flex-direction: column; }\n");
        sb.append(".title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }\n");
        sb.append(".input-title { flex: 1; font-size: 26px; font-weight: 700; background: transparent; border: none; color: #fff; outline: none; }\n");
        sb.append(".pin-toggle { background: var(--card); border: 1px solid var(--border); color: var(--text-dim); padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }\n");
        sb.append(".pin-toggle.pinned { color: var(--warning); border-color: var(--warning); background: rgba(245,158,11,0.1); }\n");
        sb.append(".meta-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }\n");
        sb.append(".input-tag { font-size: 12.5px; font-weight: 500; background: var(--card); border: 1px solid var(--border); color: #c4b5fd; padding: 5px 10px; border-radius: 5px; width: 220px; outline: none; }\n");
        sb.append(".input-tag:focus { border-color: var(--accent); }\n");
        
        // Rich Content Area
        sb.append(".rich-editor { flex: 1; min-height: 360px; outline: none; color: #e2e8f0; font-size: 15px; line-height: 1.7; word-break: break-word; }\n");
        sb.append(".rich-editor h1 { font-size: 24px; font-weight: 700; color: #fff; margin: 16px 0 8px; }\n");
        sb.append(".rich-editor h2 { font-size: 20px; font-weight: 600; color: #fff; margin: 14px 0 6px; }\n");
        sb.append(".rich-editor h3 { font-size: 17px; font-weight: 600; color: #fff; margin: 12px 0 4px; }\n");
        sb.append(".rich-editor p { margin-bottom: 10px; }\n");
        sb.append(".rich-editor ul, .rich-editor ol { padding-left: 24px; margin-bottom: 10px; }\n");
        sb.append(".rich-editor li { margin-bottom: 4px; }\n");
        sb.append(".rich-editor blockquote { border-left: 3px solid var(--accent); padding: 6px 14px; color: #cbd5e1; background: rgba(139,92,246,0.06); margin: 12px 0; border-radius: 0 6px 6px 0; }\n");
        sb.append(".rich-editor pre { background: #0f131d; padding: 12px; border-radius: 6px; border: 1px solid var(--border); overflow-x: auto; margin: 12px 0; }\n");
        sb.append(".rich-editor code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13.5px; }\n");
        sb.append(".rich-editor a { color: var(--accent); text-decoration: underline; }\n");
        sb.append(".rich-editor hr { border: none; border-top: 1px solid var(--border); margin: 16px 0; }\n");
        sb.append(".rich-editor table { border-collapse: collapse; width: 100%; margin: 12px 0; }\n");
        sb.append(".rich-editor th, .rich-editor td { border: 1px solid var(--border); padding: 8px 12px; }\n");
        sb.append(".rich-editor th { background: var(--card); font-weight: 600; }\n");
        sb.append(".raw-editor { width: 100%; flex: 1; min-height: 360px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; line-height: 1.6; background: transparent; border: none; color: #e2e8f0; resize: none; outline: none; display: none; }\n");

        // Trash banner in editor
        sb.append(".trash-banner { background: var(--danger-bg); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 13px; color: #fca5a5; display: flex; align-items: center; justify-content: space-between; }\n");

        // Footer & Toast
        sb.append(".editor-footer { padding: 10px 24px; border-top: 1px solid var(--border); font-size: 11.5px; color: var(--text-dim); display: flex; justify-content: space-between; background: var(--sidebar); }\n");
        sb.append(".toast { position: fixed; bottom: 20px; right: 20px; background: var(--success); color: #fff; padding: 10px 18px; border-radius: 7px; font-size: 12.5px; font-weight: 600; box-shadow: 0 10px 20px rgba(0,0,0,0.5); transform: translateY(60px); opacity: 0; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none; z-index: 1000; }\n");
        sb.append(".toast.show { transform: translateY(0); opacity: 1; }\n");
        sb.append(".toast.error { background: var(--danger); }\n");
        sb.append("</style>\n</head>\n<body>\n");

        // Sidebar HTML
        sb.append("<div class='sidebar'>\n");
        sb.append("  <div class='brand'>\n");
        sb.append("    <div class='brand-title'><span>Saral Lekhan</span><span style='color:var(--accent); font-weight:400;'>Studio</span></div>\n");
        sb.append("    <div style='display:flex; align-items:center; gap:8px;'>\n");
        sb.append("      <div class='pulse-dot' title='Connected Live to Mobile'></div>\n");
        sb.append("      <button class='btn btn-primary' style='padding:5px 12px; font-size:12px;' id='newNoteBtn'>+ New Note</button>\n");
        sb.append("    </div>\n");
        sb.append("  </div>\n");
        
        sb.append("  <div class='nav-tabs'>\n");
        sb.append("    <button class='nav-tab active' id='tabAll'><span>All Notes</span><span class='badge' id='badgeAll'>0</span></button>\n");
        sb.append("    <button class='nav-tab' id='tabPinned'><span>Pinned</span><span class='badge' id='badgePinned'>0</span></button>\n");
        sb.append("    <button class='nav-tab' id='tabTrash'><span>Trash</span><span class='badge' id='badgeTrash'>0</span></button>\n");
        sb.append("  </div>\n");

        sb.append("  <div class='search-box'><input type='text' class='search-input' id='searchInput' placeholder='Search notes... (Ctrl+F)'></div>\n");
        sb.append("  <div class='tag-rail' id='tagRail'></div>\n");
        sb.append("  <div id='trashHeaderContainer'></div>\n");
        sb.append("  <div class='notes-list' id='notesList'></div>\n");
        sb.append("</div>\n");

        // Editor Panel HTML
        sb.append("<div class='editor-panel' id='editorPanel'>\n");
        sb.append("  <div class='editor-header'>\n");
        sb.append("    <div class='sync-status' id='syncStatus'><span>&#x2713; Live Sync Ready</span></div>\n");
        sb.append("    <div class='header-actions' id='headerActions'>\n");
        sb.append("      <button class='btn btn-danger' id='deleteBtn' title='Move note to Trash'>Trash</button>\n");
        sb.append("      <button class='btn btn-secondary' id='copyBtn' title='Copy Note Content'>Copy</button>\n");
        sb.append("      <button class='btn btn-primary' id='saveBtn' title='Save to Mobile (Ctrl+S)'>Save to Phone</button>\n");
        sb.append("    </div>\n");
        sb.append("  </div>\n");

        // Styling Toolbar HTML
        sb.append("  <div class='styling-toolbar' id='stylingToolbar'>\n");
        sb.append("    <select class='tool-select' id='formatSelect' onchange='applyHeading(this.value)'>\n");
        sb.append("      <option value='p'>Paragraph</option>\n");
        sb.append("      <option value='h1'>Heading 1</option>\n");
        sb.append("      <option value='h2'>Heading 2</option>\n");
        sb.append("      <option value='h3'>Heading 3</option>\n");
        sb.append("    </select>\n");
        sb.append("    <div class='tool-divider'></div>\n");
        sb.append("    <button class='tool-btn' onclick=\"exec('bold')\" title='Bold (Ctrl+B)'><b>B</b></button>\n");
        sb.append("    <button class='tool-btn' onclick=\"exec('italic')\" title='Italic (Ctrl+I)'><i>I</i></button>\n");
        sb.append("    <button class='tool-btn' onclick=\"exec('underline')\" title='Underline (Ctrl+U)'><u>U</u></button>\n");
        sb.append("    <button class='tool-btn' onclick=\"exec('strikeThrough')\" title='Strikethrough'><s>S</s></button>\n");
        sb.append("    <div class='tool-divider'></div>\n");
        sb.append("    <button class='tool-btn' onclick=\"exec('insertUnorderedList')\" title='Bullet List'>&#x2022;</button>\n");
        sb.append("    <button class='tool-btn' onclick=\"exec('insertOrderedList')\" title='Numbered List'>1.</button>\n");
        sb.append("    <button class='tool-btn' onclick=\"applyBlockquote()\" title='Quote'>&ldquo;</button>\n");
        sb.append("    <button class='tool-btn' onclick=\"applyCode()\" title='Inline Code'>&lt;/&gt;</button>\n");
        sb.append("    <button class='tool-btn' onclick=\"applyLink()\" title='Insert Link'>&#x1F517;</button>\n");
        sb.append("    <button class='tool-btn' onclick=\"exec('insertHorizontalRule')\" title='Divider'>&minus;</button>\n");
        sb.append("    <button class='tool-btn' onclick=\"exec('removeFormat')\" title='Clear Formatting'>&#x2715;</button>\n");
        sb.append("    <div class='view-mode-toggle'>\n");
        sb.append("      <button class='tool-btn active' id='btnVisual' onclick=\"switchMode('visual')\" title='Visual WYSIWYG Mode'>Visual</button>\n");
        sb.append("      <button class='tool-btn' id='btnSource' onclick=\"switchMode('source')\" title='Source Code (HTML/Markdown)'>Source</button>\n");
        sb.append("    </div>\n");
        sb.append("  </div>\n");

        // Editor Content Area
        sb.append("  <div class='editor-scroll'>\n");
        sb.append("    <div id='trashBannerContainer'></div>\n");
        sb.append("    <div class='title-row'>\n");
        sb.append("      <input type='text' class='input-title' id='editTitle' placeholder='Note Title...'>\n");
        sb.append("      <button class='pin-toggle' id='pinBtn' onclick='togglePin()'>&#x2605; Pin</button>\n");
        sb.append("    </div>\n");
        sb.append("    <div class='meta-row'>\n");
        sb.append("      <input type='text' class='input-tag' id='editTag' placeholder='Tag (e.g. Work, Ideas)...'>\n");
        sb.append("    </div>\n");
        sb.append("    <div class='rich-editor' id='richEditor' contenteditable='true' placeholder='Start typing here...'></div>\n");
        sb.append("    <textarea class='raw-editor' id='rawEditor' placeholder='Raw HTML / Markdown...'></textarea>\n");
        sb.append("  </div>\n");

        // Footer & Toast HTML
        sb.append("  <div class='editor-footer'>\n");
        sb.append("    <span id='wordCount'>0 words | 0 characters</span>\n");
        sb.append("    <span id='footerInfo'>Saral Lekhan Plus Live Studio</span>\n");
        sb.append("  </div>\n");
        sb.append("</div>\n");
        sb.append("<div class='toast' id='toast'>Saved to phone!</div>\n");

        // JavaScript Logic
        sb.append("<script>\n");
        sb.append("let allNotes = [];\n");
        sb.append("let currentTab = 'all';\n"); // 'all' | 'pinned' | 'trash'
        sb.append("let selectedTag = null;\n");
        sb.append("let activeNoteId = null;\n");
        sb.append("let isCreatingNew = false;\n");
        sb.append("let isPinned = false;\n");
        sb.append("let editorMode = 'visual';\n");
        sb.append("let isDirty = false;\n");
        sb.append("let autoSaveTimer = null;\n");

        sb.append("async function fetchNotes() {\n");
        sb.append("  try {\n");
        sb.append("    const res = await fetch('/api/notes');\n");
        sb.append("    if (!res.ok) return;\n");
        sb.append("    const data = await res.json();\n");
        sb.append("    allNotes = Array.isArray(data) ? data : [];\n");
        sb.append("    updateCountsAndBadges();\n");
        sb.append("    renderTags();\n");
        sb.append("    renderList();\n");
        sb.append("    if (!isCreatingNew && !isDirty && allNotes.length > 0 && !activeNoteId) {\n");
        sb.append("      const activeList = getFilteredNotes();\n");
        sb.append("      if (activeList.length > 0) selectNote(activeList[0].id);\n");
        sb.append("    }\n");
        sb.append("  } catch (err) { console.warn('Fetch notes failed:', err); }\n");
        sb.append("}\n");

        sb.append("function getFilteredNotes() {\n");
        sb.append("  const query = document.getElementById('searchInput').value.toLowerCase().trim();\n");
        sb.append("  return allNotes.filter(n => {\n");
        sb.append("    const isDeleted = Boolean(n.is_deleted);\n");
        sb.append("    if (currentTab === 'trash') { if (!isDeleted) return false; }\n");
        sb.append("    else if (currentTab === 'pinned') { if (isDeleted || !n.pinned) return false; }\n");
        sb.append("    else { if (isDeleted) return false; }\n"); // 'all' tab
        sb.append("    if (selectedTag && (n.tag || '').toLowerCase() !== selectedTag.toLowerCase()) return false;\n");
        sb.append("    if (query) {\n");
        sb.append("      const text = ((n.title || '') + ' ' + (n.body || '') + ' ' + (n.tag || '')).toLowerCase();\n");
        sb.append("      if (!text.includes(query)) return false;\n");
        sb.append("    }\n");
        sb.append("    return true;\n");
        sb.append("  });\n");
        sb.append("}\n");

        sb.append("function updateCountsAndBadges() {\n");
        sb.append("  const allActive = allNotes.filter(n => !n.is_deleted);\n");
        sb.append("  const pinnedActive = allActive.filter(n => n.pinned);\n");
        sb.append("  const trashNotes = allNotes.filter(n => n.is_deleted);\n");
        sb.append("  document.getElementById('badgeAll').innerText = allActive.length;\n");
        sb.append("  document.getElementById('badgePinned').innerText = pinnedActive.length;\n");
        sb.append("  document.getElementById('badgeTrash').innerText = trashNotes.length;\n");
        sb.append("}\n");

        sb.append("function renderTags() {\n");
        sb.append("  const rail = document.getElementById('tagRail');\n");
        sb.append("  const activeNotes = allNotes.filter(n => !n.is_deleted);\n");
        sb.append("  const tagSet = new Set();\n");
        sb.append("  activeNotes.forEach(n => { if (n.tag && n.tag.trim()) tagSet.add(n.tag.trim()); });\n");
        sb.append("  if (tagSet.size === 0) { rail.style.display = 'none'; return; }\n");
        sb.append("  rail.style.display = 'flex';\n");
        sb.append("  rail.innerHTML = '';\n");
        sb.append("  const allTag = document.createElement('button');\n");
        sb.append("  allTag.className = 'filter-tag' + (selectedTag === null ? ' active' : '');\n");
        sb.append("  allTag.innerText = 'All Tags';\n");
        sb.append("  allTag.onclick = () => { selectedTag = null; renderTags(); renderList(); };\n");
        sb.append("  rail.appendChild(allTag);\n");
        sb.append("  tagSet.forEach(tag => {\n");
        sb.append("    const btn = document.createElement('button');\n");
        sb.append("    btn.className = 'filter-tag' + (selectedTag === tag ? ' active' : '');\n");
        sb.append("    btn.innerText = '#' + tag;\n");
        sb.append("    btn.onclick = () => { selectedTag = (selectedTag === tag ? null : tag); renderTags(); renderList(); };\n");
        sb.append("    rail.appendChild(btn);\n");
        sb.append("  });\n");
        sb.append("}\n");

        sb.append("function renderList() {\n");
        sb.append("  const listEl = document.getElementById('notesList');\n");
        sb.append("  const trashContainer = document.getElementById('trashHeaderContainer');\n");
        sb.append("  if (currentTab === 'trash') {\n");
        sb.append("    trashContainer.innerHTML = `<div class='trash-header'><span>Trash View</span><button class='trash-empty-btn' onclick='emptyTrash()'>Empty Trash</button></div>`;\n");
        sb.append("  } else { trashContainer.innerHTML = ''; }\n");
        sb.append("  const filtered = getFilteredNotes();\n");
        sb.append("  listEl.innerHTML = '';\n");
        sb.append("  if (filtered.length === 0) {\n");
        sb.append("    const msg = currentTab === 'trash' ? 'Trash is empty' : (isCreatingNew ? 'Creating new note...' : 'No notes found');\n");
        sb.append("    listEl.innerHTML = `<div style=\"padding:40px 10px; color:#64748b; text-align:center; font-size:13px;\">${msg}</div>`;\n");
        sb.append("    return;\n");
        sb.append("  }\n");
        sb.append("  filtered.forEach(n => {\n");
        sb.append("    const el = document.createElement('div');\n");
        sb.append("    el.className = 'note-item' + (n.id === activeNoteId && !isCreatingNew ? ' active' : '');\n");
        sb.append("    const cleanSnippet = (n.body || 'Empty note').replace(/<[^>]*>?/gm, ' ').substring(0, 90);\n");
        sb.append("    const dateStr = n.updated_at ? new Date(n.updated_at).toLocaleDateString() : '';\n");
        sb.append("    el.innerHTML = `<div class='note-title'><span>${escapeHtml(n.title || 'Untitled')}</span>${n.pinned ? '<span class=\"pin-icon\">&#x2605;</span>' : ''}</div><div class='note-snippet'>${escapeHtml(cleanSnippet)}</div><div class='note-meta'><span>${dateStr}</span>${n.tag ? `<span class='tag-pill'>${escapeHtml(n.tag)}</span>` : ''}</div>`;\n");
        sb.append("    el.onclick = () => selectNote(n.id);\n");
        sb.append("    listEl.appendChild(el);\n");
        sb.append("  });\n");
        sb.append("}\n");

        sb.append("function selectNote(id) {\n");
        sb.append("  if (isDirty && activeNoteId && activeNoteId !== id) saveNoteSilently();\n");
        sb.append("  isCreatingNew = false;\n");
        sb.append("  activeNoteId = id;\n");
        sb.append("  isDirty = false;\n");
        sb.append("  const n = allNotes.find(x => x.id === id);\n");
        sb.append("  if (!n) return;\n");
        sb.append("  document.getElementById('editTitle').value = n.title || '';\n");
        sb.append("  document.getElementById('editTag').value = n.tag || '';\n");
        sb.append("  isPinned = Boolean(n.pinned);\n");
        sb.append("  updatePinButton();\n");
        sb.append("  const richEl = document.getElementById('richEditor');\n");
        sb.append("  const rawEl = document.getElementById('rawEditor');\n");
        sb.append("  richEl.innerHTML = n.body || '';\n");
        sb.append("  rawEl.value = n.body || '';\n");
        sb.append("  renderTrashBanner(Boolean(n.is_deleted));\n");
        sb.append("  renderHeaderActions(Boolean(n.is_deleted));\n");
        sb.append("  renderList();\n");
        sb.append("  updateCounts();\n");
        sb.append("}\n");

        sb.append("function renderTrashBanner(isDeleted) {\n");
        sb.append("  const container = document.getElementById('trashBannerContainer');\n");
        sb.append("  const stylingToolbar = document.getElementById('stylingToolbar');\n");
        sb.append("  const richEditor = document.getElementById('richEditor');\n");
        sb.append("  if (isDeleted) {\n");
        sb.append("    container.innerHTML = `<div class='trash-banner'><span>&#x26A0; This note is in Trash. Restore it to make edits.</span><div style='display:flex; gap:8px;'><button class='btn btn-success' onclick='restoreNote(${activeNoteId})'>Restore</button><button class='btn btn-danger' onclick='deleteForever(${activeNoteId})'>Delete Forever</button></div></div>`;\n");
        sb.append("    stylingToolbar.style.display = 'none';\n");
        sb.append("    richEditor.contentEditable = 'false';\n");
        sb.append("  } else {\n");
        sb.append("    container.innerHTML = '';\n");
        sb.append("    stylingToolbar.style.display = 'flex';\n");
        sb.append("    richEditor.contentEditable = 'true';\n");
        sb.append("  }\n");
        sb.append("}\n");

        sb.append("function renderHeaderActions(isDeleted) {\n");
        sb.append("  const actions = document.getElementById('headerActions');\n");
        sb.append("  if (isDeleted) {\n");
        sb.append("    actions.innerHTML = `<button class='btn btn-success' onclick='restoreNote(${activeNoteId})'>Restore</button><button class='btn btn-danger' onclick='deleteForever(${activeNoteId})'>Delete Forever</button>`;\n");
        sb.append("  } else {\n");
        sb.append("    actions.innerHTML = `<button class='btn btn-danger' id='deleteBtn' onclick='trashCurrentNote()'>Trash</button><button class='btn btn-secondary' id='copyBtn' onclick='copyContent()'>Copy</button><button class='btn btn-primary' id='saveBtn' onclick='saveCurrentNote()'>Save to Phone</button>`;\n");
        sb.append("  }\n");
        sb.append("}\n");

        sb.append("function updatePinButton() {\n");
        sb.append("  const btn = document.getElementById('pinBtn');\n");
        sb.append("  if (isPinned) {\n");
        sb.append("    btn.className = 'pin-toggle pinned'; btn.innerHTML = '&#x2605; Pinned';\n");
        sb.append("  } else {\n");
        sb.append("    btn.className = 'pin-toggle'; btn.innerHTML = '&#x2606; Pin';\n");
        sb.append("  }\n");
        sb.append("}\n");

        sb.append("function togglePin() {\n");
        sb.append("  isPinned = !isPinned;\n");
        sb.append("  updatePinButton();\n");
        sb.append("  isDirty = true;\n");
        sb.append("  triggerAutoSave();\n");
        sb.append("}\n");

        sb.append("function triggerAutoSave() {\n");
        sb.append("  clearTimeout(autoSaveTimer);\n");
        sb.append("  setSyncStatus('Saving...', false);\n");
        sb.append("  autoSaveTimer = setTimeout(() => { saveCurrentNote(true); }, 1500);\n");
        sb.append("}\n");

        sb.append("function setSyncStatus(text, isSaved) {\n");
        sb.append("  const el = document.getElementById('syncStatus');\n");
        sb.append("  el.innerHTML = `<span>${text}</span>`;\n");
        sb.append("  el.className = 'sync-status' + (isSaved ? ' saved' : '');\n");
        sb.append("}\n");

        sb.append("async function saveCurrentNote(isAuto = false) {\n");
        sb.append("  syncEditorContentToModel();\n");
        sb.append("  const title = document.getElementById('editTitle').value.trim();\n");
        sb.append("  const tag = document.getElementById('editTag').value.trim();\n");
        sb.append("  const body = editorMode === 'visual' ? document.getElementById('richEditor').innerHTML : document.getElementById('rawEditor').value;\n");
        sb.append("  if (!title && !body && isCreatingNew) return;\n");
        sb.append("  const action = isCreatingNew ? 'create' : 'save';\n");
        sb.append("  const noteId = isCreatingNew ? Date.now() : activeNoteId;\n");
        sb.append("  const notePayload = { id: noteId, title: title || 'Untitled', tag, body, pinned: isPinned, updated_at: Date.now() };\n");
        sb.append("  try {\n");
        sb.append("    await fetch('/api/notes', {\n");
        sb.append("      method: 'POST',\n");
        sb.append("      headers: { 'Content-Type': 'application/json' },\n");
        sb.append("      body: JSON.stringify({ action, note: notePayload })\n");
        sb.append("    });\n");
        sb.append("    isDirty = false;\n");
        sb.append("    setSyncStatus('&#x2713; Synced with phone', true);\n");
        sb.append("    if (!isAuto) showToast('Saved to mobile device!');\n");
        sb.append("    if (isCreatingNew) {\n");
        sb.append("      isCreatingNew = false;\n");
        sb.append("      activeNoteId = noteId;\n");
        sb.append("      allNotes.unshift(notePayload);\n");
        sb.append("    } else {\n");
        sb.append("      const existing = allNotes.find(x => x.id === activeNoteId);\n");
        sb.append("      if (existing) Object.assign(existing, notePayload);\n");
        sb.append("    }\n");
        sb.append("    updateCountsAndBadges();\n");
        sb.append("    renderTags();\n");
        sb.append("    renderList();\n");
        sb.append("  } catch(e) { setSyncStatus('&#x26A0; Sync failed', false); if(!isAuto) showToast('Error saving note', true); }\n");
        sb.append("}\n");

        sb.append("async function saveNoteSilently() {\n");
        sb.append("  await saveCurrentNote(true);\n");
        sb.append("}\n");

        sb.append("async function trashCurrentNote() {\n");
        sb.append("  if (!activeNoteId) return;\n");
        sb.append("  try {\n");
        sb.append("    await fetch('/api/notes', {\n");
        sb.append("      method: 'POST',\n");
        sb.append("      headers: { 'Content-Type': 'application/json' },\n");
        sb.append("      body: JSON.stringify({ action: 'delete', noteId: activeNoteId })\n");
        sb.append("    });\n");
        sb.append("    const note = allNotes.find(x => x.id === activeNoteId);\n");
        sb.append("    if (note) note.is_deleted = true;\n");
        sb.append("    showToast('Moved note to Trash');\n");
        sb.append("    updateCountsAndBadges();\n");
        sb.append("    const nextActive = getFilteredNotes();\n");
        sb.append("    if (nextActive.length > 0) selectNote(nextActive[0].id);\n");
        sb.append("    else createNewNote();\n");
        sb.append("  } catch (e) { showToast('Error moving to trash', true); }\n");
        sb.append("}\n");

        sb.append("async function restoreNote(id) {\n");
        sb.append("  try {\n");
        sb.append("    await fetch('/api/notes', {\n");
        sb.append("      method: 'POST',\n");
        sb.append("      headers: { 'Content-Type': 'application/json' },\n");
        sb.append("      body: JSON.stringify({ action: 'restore', noteId: id })\n");
        sb.append("    });\n");
        sb.append("    const note = allNotes.find(x => x.id === id);\n");
        sb.append("    if (note) note.is_deleted = false;\n");
        sb.append("    showToast('Note restored!');\n");
        sb.append("    updateCountsAndBadges();\n");
        sb.append("    renderList();\n");
        sb.append("    renderTrashBanner(false);\n");
        sb.append("    renderHeaderActions(false);\n");
        sb.append("  } catch (e) { showToast('Error restoring note', true); }\n");
        sb.append("}\n");

        sb.append("async function deleteForever(id) {\n");
        sb.append("  if (!confirm('Permanently delete this note? This cannot be undone.')) return;\n");
        sb.append("  try {\n");
        sb.append("    await fetch('/api/notes', {\n");
        sb.append("      method: 'POST',\n");
        sb.append("      headers: { 'Content-Type': 'application/json' },\n");
        sb.append("      body: JSON.stringify({ action: 'permanentlyDelete', noteId: id })\n");
        sb.append("    });\n");
        sb.append("    allNotes = allNotes.filter(x => x.id !== id);\n");
        sb.append("    showToast('Permanently deleted');\n");
        sb.append("    updateCountsAndBadges();\n");
        sb.append("    const next = getFilteredNotes();\n");
        sb.append("    if (next.length > 0) selectNote(next[0].id);\n");
        sb.append("    else createNewNote();\n");
        sb.append("  } catch (e) { showToast('Error deleting', true); }\n");
        sb.append("}\n");

        sb.append("async function emptyTrash() {\n");
        sb.append("  if (!confirm('Permanently delete ALL notes in trash?')) return;\n");
        sb.append("  try {\n");
        sb.append("    await fetch('/api/notes', {\n");
        sb.append("      method: 'POST',\n");
        sb.append("      headers: { 'Content-Type': 'application/json' },\n");
        sb.append("      body: JSON.stringify({ action: 'emptyTrash' })\n");
        sb.append("    });\n");
        sb.append("    allNotes = allNotes.filter(x => !x.is_deleted);\n");
        sb.append("    showToast('Trash emptied');\n");
        sb.append("    updateCountsAndBadges();\n");
        sb.append("    renderList();\n");
        sb.append("  } catch (e) { showToast('Error emptying trash', true); }\n");
        sb.append("}\n");

        sb.append("function createNewNote() {\n");
        sb.append("  if (isDirty && activeNoteId) saveNoteSilently();\n");
        sb.append("  isCreatingNew = true;\n");
        sb.append("  activeNoteId = null;\n");
        sb.append("  isDirty = false;\n");
        sb.append("  isPinned = false;\n");
        sb.append("  document.getElementById('editTitle').value = '';\n");
        sb.append("  document.getElementById('editTag').value = selectedTag || '';\n");
        sb.append("  document.getElementById('richEditor').innerHTML = '';\n");
        sb.append("  document.getElementById('rawEditor').value = '';\n");
        sb.append("  updatePinButton();\n");
        sb.append("  renderTrashBanner(false);\n");
        sb.append("  renderHeaderActions(false);\n");
        sb.append("  renderList();\n");
        sb.append("  document.getElementById('editTitle').focus();\n");
        sb.append("  updateCounts();\n");
        sb.append("}\n");

        sb.append("function copyContent() {\n");
        sb.append("  const title = document.getElementById('editTitle').value;\n");
        sb.append("  const text = document.getElementById('richEditor').innerText;\n");
        sb.append("  navigator.clipboard.writeText(`# ${title}\\n\\n${text}`);\n");
        sb.append("  showToast('Copied to clipboard!');\n");
        sb.append("}\n");

        sb.append("function updateCounts() {\n");
        sb.append("  const text = document.getElementById('richEditor').innerText.trim();\n");
        sb.append("  const chars = text.length;\n");
        sb.append("  const words = text ? text.split(/\\s+/).filter(Boolean).length : 0;\n");
        sb.append("  document.getElementById('wordCount').innerText = `${words} words | ${chars} characters`;\n");
        sb.append("}\n");

        sb.append("function escapeHtml(str) {\n");
        sb.append("  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');\n");
        sb.append("}\n");

        sb.append("function showToast(msg, isError = false) {\n");
        sb.append("  const t = document.getElementById('toast');\n");
        sb.append("  t.innerText = msg || 'Saved';\n");
        sb.append("  t.className = 'toast show' + (isError ? ' error' : '');\n");
        sb.append("  setTimeout(() => { t.className = 'toast'; }, 2600);\n");
        sb.append("}\n");

        // Rich text formatting helpers
        sb.append("function exec(command, value = null) {\n");
        sb.append("  document.getElementById('richEditor').focus();\n");
        sb.append("  document.execCommand(command, false, value);\n");
        sb.append("  isDirty = true;\n");
        sb.append("  triggerAutoSave();\n");
        sb.append("  updateCounts();\n");
        sb.append("}\n");

        sb.append("function applyHeading(tag) {\n");
        sb.append("  exec('formatBlock', tag);\n");
        sb.append("}\n");

        sb.append("function applyBlockquote() {\n");
        sb.append("  exec('formatBlock', 'blockquote');\n");
        sb.append("}\n");

        sb.append("function applyCode() {\n");
        sb.append("  const selection = window.getSelection();\n");
        sb.append("  if (!selection.rangeCount) return;\n");
        sb.append("  const text = selection.toString();\n");
        sb.append("  if (text.includes('\\n')) {\n");
        sb.append("    exec('insertHTML', `<pre><code>${escapeHtml(text)}</code></pre>`);\n");
        sb.append("  } else {\n");
        sb.append("    exec('insertHTML', `<code>${escapeHtml(text || 'code')}</code>`);\n");
        sb.append("  }\n");
        sb.append("}\n");

        sb.append("function applyLink() {\n");
        sb.append("  const url = prompt('Enter URL (e.g. https://example.com):');\n");
        sb.append("  if (url) exec('createLink', url);\n");
        sb.append("}\n");

        sb.append("function switchMode(mode) {\n");
        sb.append("  editorMode = mode;\n");
        sb.append("  const richEl = document.getElementById('richEditor');\n");
        sb.append("  const rawEl = document.getElementById('rawEditor');\n");
        sb.append("  const btnVisual = document.getElementById('btnVisual');\n");
        sb.append("  const btnSource = document.getElementById('btnSource');\n");
        sb.append("  if (mode === 'source') {\n");
        sb.append("    rawEl.value = richEl.innerHTML;\n");
        sb.append("    richEl.style.display = 'none';\n");
        sb.append("    rawEl.style.display = 'block';\n");
        sb.append("    btnSource.classList.add('active');\n");
        sb.append("    btnVisual.classList.remove('active');\n");
        sb.append("  } else {\n");
        sb.append("    richEl.innerHTML = rawEl.value;\n");
        sb.append("    rawEl.style.display = 'none';\n");
        sb.append("    richEl.style.display = 'block';\n");
        sb.append("    btnVisual.classList.add('active');\n");
        sb.append("    btnSource.classList.remove('active');\n");
        sb.append("  }\n");
        sb.append("}\n");

        sb.append("function syncEditorContentToModel() {\n");
        sb.append("  const richEl = document.getElementById('richEditor');\n");
        sb.append("  const rawEl = document.getElementById('rawEditor');\n");
        sb.append("  if (editorMode === 'source') {\n");
        sb.append("    richEl.innerHTML = rawEl.value;\n");
        sb.append("  } else {\n");
        sb.append("    rawEl.value = richEl.innerHTML;\n");
        sb.append("  }\n");
        sb.append("}\n");

        // Event Listeners setup
        sb.append("document.getElementById('newNoteBtn').addEventListener('click', createNewNote);\n");
        sb.append("document.getElementById('searchInput').addEventListener('input', renderList);\n");
        sb.append("document.getElementById('richEditor').addEventListener('input', () => { isDirty = true; updateCounts(); triggerAutoSave(); });\n");
        sb.append("document.getElementById('rawEditor').addEventListener('input', () => { isDirty = true; updateCounts(); triggerAutoSave(); });\n");
        sb.append("document.getElementById('editTitle').addEventListener('input', () => { isDirty = true; triggerAutoSave(); });\n");
        sb.append("document.getElementById('editTag').addEventListener('input', () => { isDirty = true; triggerAutoSave(); });\n");

        sb.append("document.getElementById('tabAll').addEventListener('click', () => {\n");
        sb.append("  currentTab = 'all'; document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));\n");
        sb.append("  document.getElementById('tabAll').classList.add('active'); renderList();\n");
        sb.append("});\n");
        sb.append("document.getElementById('tabPinned').addEventListener('click', () => {\n");
        sb.append("  currentTab = 'pinned'; document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));\n");
        sb.append("  document.getElementById('tabPinned').classList.add('active'); renderList();\n");
        sb.append("});\n");
        sb.append("document.getElementById('tabTrash').addEventListener('click', () => {\n");
        sb.append("  currentTab = 'trash'; document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));\n");
        sb.append("  document.getElementById('tabTrash').classList.add('active'); renderList();\n");
        sb.append("});\n");

        // Keyboard Shortcuts (Ctrl+S / Cmd+S save)
        sb.append("document.addEventListener('keydown', (e) => {\n");
        sb.append("  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {\n");
        sb.append("    e.preventDefault(); saveCurrentNote();\n");
        sb.append("  }\n");
        sb.append("  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {\n");
        sb.append("    e.preventDefault(); document.getElementById('searchInput').focus();\n");
        sb.append("  }\n");
        sb.append("});\n");

        sb.append("fetchNotes();\n");
        sb.append("setInterval(fetchNotes, 4000);\n");
        sb.append("</script>\n</body>\n</html>\n");
        return sb.toString();
    }
}
