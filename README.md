# 🛸 MONITOR COMPLEX

> **Real-Time Telemetry & Utility Nexus**  
> An all-in-one cyber dashboard uniting network diagnostics, vector QR code synthesis, location-aware meteorological forecasting, command link bookmark management, network configuration assistance, and live local/global news feeds with 24/7 video streaming.

---

## 🌟 Modules & Features

### 1. 🚀 Speed Test Matrix
- **Real-Time Speedometer**: SVG 270° dial gauge with dynamic gradient needle, live digital readout, and active phase indicator.
- **Precision Metrics**:
  - **Latency (Ping)**: Round-trip time sampled across low-latency global CDN edge nodes.
  - **Jitter**: Packet latency fluctuation calculation.
  - **Download Bandwidth**: Multi-stream concurrent chunk downloading with rolling moving averages.
  - **Upload Bandwidth**: Measured streaming upload throughput.
- **Waveform Canvas Graph**: 60 FPS real-time Bezier curve graph visualizing instantaneous bandwidth fluctuations.
- **Network Telemetry**: Client public IP detection, connection type (`downlink`, `effectiveType`), and connection rating verdict.
- **History Tracker**: Local persistence of past tests with rating badges and 1-click clearance.

### 2. ⚡ QR Code Studio Pro
- **Multi-Payload Generator**:
  - 🌐 **URL / Web Link**: Direct website targeting.
  - 📝 **Plain Text / Notes**: Freeform encrypted or readable text.
  - 📶 **Wi-Fi Network**: Automatic Wi-Fi connection QR (SSID, Password, Encryption WPA/WEP/Open, Hidden status).
  - 👤 **vCard Contact**: Standard Contact card (Name, Phone, Email, Organization).
  - 📧 **Email**: Pre-filled recipient, subject, and body message.
  - 📱 **Phone**: Instant tel link.
- **Vector & Style Customization**:
  - Color Pickers & Cyber Presets (Cyber Cyan, Emerald Lime, Electric Purple, Solar Amber, Crisp White, Obsidian Dark).
  - Transparent Background toggle.
  - Custom Module Styles: Classic Square, Circular Dots, Smooth Rounded Pills.
  - Error Correction Levels: L (7%), M (15%), Q (25%), H (30%).
  - Center Logo Embedding: Preset icons (WiFi, Link, Star, Shield) or Custom Image file upload.
  - Export Options: High-resolution PNG, Vector SVG, or Copy Image to Clipboard.

### 3. 🌤️ Meteorological Station (Weather Hub)
- **Geolocation-Aware**: Auto-detects device coordinates via HTML5 Geolocation API with graceful IP reverse lookup fallback.
- **Global City Search**: Instant fuzzy geocoding search for any city, state, or country on Earth via Open-Meteo Geocoding.
- **Atmospheric Sensor Matrix**:
  - Real-time temperature & "Feels Like" index.
  - Relative Humidity % and dew moisture.
  - **Wind Compass**: Rotating compass rose pointer with cardinal direction and speed.
  - **UV Index Meter**: Color-coded solar exposure categories (Low, Moderate, High, Extreme).
  - Barometric Sea-Level Pressure (hPa).
  - Sunrise & Sunset timeline with daylight progression tracking.
- **24-Hour Hourly Trajectory**: Horizontal scroll rail displaying temperature and precipitation probability.
- **7-Day Synoptic Forecast**: Daily outlook cards with visual temperature min/max range bars.
- **Unit Toggle**: 1-click °C / °F toggle with persistent preference.

### 4. 🔗 HyperLink Aggregator (Link Matrix)
- **Curated Collections**: Pre-populated with top developer tools, speed test utilities, meteorological maps, cloud platforms, and tech news.
- **Organization & Search**:
  - Real-time search across titles, URLs, descriptions, and `#tags`.
  - Category filters: All, Starred/Favorites, Development, Network, Weather, Cloud, News.
  - Sort by: Most Visited, Alphabetical (A-Z), Recently Added, Default.
- **Bookmark Management**:
  - Add custom bookmarks with auto-fetched Google Favicons or custom icons.
  - Star / Pin favorites for 1-click access from the Overview Command Deck.
  - Click tracking and "Most Visited" metrics.
  - Bulk "Launch All" in category.
  - **Data Safety**: Export to JSON and Import from JSON for zero data loss backup.

### 5. 🛠️ Network Configuration Hub (Net Config)
- **Network Telemetry**:
  - **Public IP & ASN**: Organization, ASN number, Country/City geolocation.
  - **Local Private IP (LAN)**: Discovered via WebRTC candidate probing (`192.168.x.x` / `10.x.x.x`).
  - **Router Gateway**: Auto-detects hardware gateway IP (`192.168.1.1` etc.) with 1-click admin portal launcher.
  - **Connection Interface**: Link interface type (Wi-Fi, Broadband, Cellular), RTT latency, and IPv6 detection.
- **DNS Benchmark & Quick Switch Configurator**:
  - Real-time latency benchmark across top DNS providers: Cloudflare (1.1.1.1), Google (8.8.8.8), Quad9 (9.9.9.9), AdGuard (94.140.14.14), OpenDNS (208.67.222.222).
  - OS command generator for Windows (PowerShell), Windows (CMD), macOS (Terminal), and Linux (nmcli) with 1-click script copying.
- **Network Troubleshooter & Repair Actions**:
  - 1-click copyable repair commands:
    - `ipconfig /flushdns` (Clear stale DNS cache)
    - `ipconfig /release && ipconfig /renew` (Refresh DHCP lease)
    - `netsh winsock reset && netsh int ip reset` (Reset TCP/IP & socket stack)
    - `ping 1.1.1.1 -t` (Continuous packet jitter probe)
- **Subnet & CIDR IP Calculator**:
  - Computes Subnet Mask, Wildcard Mask, Network IP, Broadcast IP, Usable Host Range, Total Usable IPs, and IP Class from any IP and CIDR prefix (/8 to /32).
- **Router Gateway & Default Credentials Reference**:
  - Built-in searchable hardware login directory (TP-Link, Netgear, ASUS, Linksys, Cisco, D-Link, Huawei, Arris).

### 6. 📺 News Hub & Live Video Streaming Feeds
- **Breaking News Ticker**:
  - Dynamic real-time scrolling marquee with pulsing red `🔴 BREAKING WIRE` badge displaying latest international and local headlines.
- **24/7 Free Live Video Feeds**:
  - High-definition embedded player streaming official 24/7 news broadcasts:
    - 🇬🇧 Sky News Live
    - 🇶🇦 Al Jazeera English
    - 🇩🇪 DW News Live (Deutsche Welle)
    - 🇫🇷 France 24 English
    - 🇺🇸 ABC News Live
    - 🇪🇺 Euronews Live
    - 🇯🇵 NHK World Japan
    - 🚀 NASA Live (Space Station & Launches)
    - 📈 Bloomberg Quicktake
    - 🌍 Africanews Live
  - Channel selector rail with viewer counters, country flags, and active channel indicators.
  - Theater Mode toggle and Custom Stream loader (paste any YouTube Live URL or video ID).
- **Global & Local News Articles Wire**:
  - Location-Aware: Feeds automatically adapt and tag local stories according to the user's detected country and city.
  - Category filters: All News Wire, 📍 Local Spotlight, 🌍 World Headlines, 💻 Tech & Cyber, 🚀 Space & Science, 📈 Markets & Economy.
  - Live search filter across headlines and summaries.
  - One-click article links and reader popups.

### 7. 🎛️ Command Deck (Overview Hub)
- Unified command matrix with live preview cards across all 6 utility modules simultaneously.
- Header with real-time digital clock (Local & UTC toggle) and network status indicator (`ONLINE` / `OFFLINE`).

### 8. 🔊 Synthesized Audio & Keyboard Shortcuts
- Low-latency Web Audio API synthesized tones for micro-interactions (toggleable with SFX button).
- Quick navigation shortcuts:
  - `1`: Command Deck
  - `2`: Speed Test
  - `3`: QR Studio
  - `4`: Weather Hub
  - `5`: Link Matrix
  - `6`: Network Configuration Hub
  - `7`: News Hub & Live Feeds

---

## 🚀 Running Locally

You can run Monitor Complex with any static file server:

```bash
# With Node.js
npm start
# or
npx serve -l 8080 .

# With Python
python -m http.server 8080
```

Open `http://localhost:8080` in any modern web browser.
