# Trace

**Trace** is a visual traceroute CLI and map dashboard built with Flask and Leaflet. It combines terminal-style input with real-time geolocation and hop visualization, making it easy to explore network paths interactively.

---

## 🔍 Features

- Terminal-style interface: `enter hostname or ip address:`
- Runs `traceroute -n` to avoid DNS delays
- Displays hop-by-hop output with RTT and reverse DNS
- Geolocates each hop using `ip-api.com`
- Plots hops on a dark-themed Leaflet map
- Connects hops with lines and labels each marker
- Fully client-side frontend with dark mode styling

---

## 🗂 Project Structure
```
trace/ 
├── static/ 
│     ├── trace.html # Main UI: map + CLI 
│     ├── trace.js # Frontend logic: traceroute + map 
├── trace.py # Flask backend: /api/trace
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
pip install flask requests
```
### 2. Install traceroute
```bash
sudo apt install traceroute
```
### 3. Run the server
```bash
python trace.py
```
Then open http://localhost:5001/static/trace.html

## 🛠 API Endpoint
GET /api/trace?ip=1.1.1.1
Returns a list of hops:

```json
[
  {
    "ip": "192.168.1.1",
    "rtt": 1.23,
    "reverse_dns": "router.local",
    "latitude": 42.65,
    "longitude": -73.75,
    "city": "Albany",
    "region": "New York",
    "country": "United States"
  },
  ...
]
```

## 📦 Deployment Notes

Requires outbound access to ip-api.com

Works on Linux with traceroute installed

Tested with Python 3.10+
