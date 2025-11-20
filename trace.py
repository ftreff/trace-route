import subprocess
import socket
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

def run_traceroute(ip):
    try:
        output = subprocess.check_output(["traceroute", "-n", ip], stderr=subprocess.STDOUT, timeout=10)
        lines = output.decode().splitlines()[1:]  # skip header
        hops = []

        for line in lines:
            parts = line.split()
            if len(parts) < 2:
                continue

            hop_ip = None
            rtt_values = []

            for part in parts[1:]:
                if part.count('.') == 3 and not hop_ip:
                    hop_ip = part
                elif "ms" in part:
                    try:
                        rtt_values.append(float(part.replace("ms", "")))
                    except:
                        pass

            rtt = round(sum(rtt_values) / len(rtt_values), 2) if rtt_values else None

            if hop_ip:
                hops.append({
                    "ip": hop_ip,
                    "rtt": rtt
                })

        return hops
    except Exception as e:
        print(f"Traceroute failed: {e}")
        return []

def enrich_hop(hop):
    ip = hop["ip"]
    hop["reverse_dns"] = None
    hop["latitude"] = None
    hop["longitude"] = None
    hop["city"] = None
    hop["region"] = None
    hop["country"] = None

    try:
        hop["reverse_dns"] = socket.gethostbyaddr(ip)[0]
    except:
        pass

    try:
        geo = requests.get(f"http://ip-api.com/json/{ip}").json()
        if geo["status"] == "success":
            hop["latitude"] = geo.get("lat")
            hop["longitude"] = geo.get("lon")
            hop["city"] = geo.get("city")
            hop["region"] = geo.get("regionName")
            hop["country"] = geo.get("country")
    except Exception as e:
        print(f"GeoIP failed for {ip}: {e}")

    return hop

@app.route("/api/trace")
def api_trace():
    ip = request.args.get("ip")
    if not ip:
        return jsonify({"error": "Missing IP"}), 400

    raw_hops = run_traceroute(ip)
    enriched = [enrich_hop(hop) for hop in raw_hops]
    return jsonify(enriched)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
