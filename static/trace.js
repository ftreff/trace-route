let map;
let hopMarkers = [];
let hopLines = [];

function initMap() {
  map = L.map("map").setView([42.6526, -73.7562], 3); // Albany, NY

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}

function clearMap() {
  hopMarkers.forEach(m => map.removeLayer(m));
  hopLines.forEach(l => map.removeLayer(l));
  hopMarkers = [];
  hopLines = [];
}

function logToTerminal(text) {
  const output = document.getElementById("output");
  const line = document.createElement("div");
  line.className = "hop-line";
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function runTrace(ip) {
  clearMap();
  document.getElementById("output").innerHTML = "";
  logToTerminal(`tracing route to ${ip}...\n`);

  fetch(`/api/trace?ip=${encodeURIComponent(ip)}`)
    .then(res => res.json())
    .then(hops => {
      if (!Array.isArray(hops) || hops.length === 0) {
        logToTerminal("no hops found or trace failed.");
        return;
      }

      let prevLatLng = null;

      hops.forEach((hop, i) => {
        const {
          ip,
          reverse_dns,
          rtt,
          latitude,
          longitude,
          city,
          region,
          country
        } = hop;

        const label = `${ip || "*"} ${reverse_dns || ""} ${city || ""} ${region || ""} ${country || ""}`.trim();
        const rttLabel = rtt ? ` (${rtt} ms)` : "";

        logToTerminal(`hop ${i + 1}: ${label}${rttLabel}`);

        if (latitude && longitude) {
          const latlng = [latitude, longitude];

          const marker = L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#00ff00",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });

          const popup = `
            <b>Hop ${i + 1}</b><br>
            <b>IP:</b> ${ip || "N/A"}<br>
            <b>Reverse DNS:</b> ${reverse_dns || "N/A"}<br>
            <b>City:</b> ${city || "N/A"}<br>
            <b>Region:</b> ${region || "N/A"}<br>
            <b>Country:</b> ${country || "N/A"}<br>
            <b>RTT:</b> ${rtt || "N/A"} ms
          `;

          marker.bindPopup(popup);
          marker.addTo(map);
          hopMarkers.push(marker);

          if (prevLatLng) {
            const line = L.polyline([prevLatLng, latlng], {
              color: "#00ff00",
              weight: 2,
              opacity: 0.7
            }).addTo(map);

            hopLines.push(line);
          }

          prevLatLng = latlng;
        }
      });

      map.fitBounds(L.featureGroup(hopMarkers).getBounds(), { padding: [20, 20] });
    })
    .catch(err => {
      console.error("trace failed:", err);
      logToTerminal("trace failed.");
    });
}

document.getElementById("ipInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const ip = e.target.value.trim();
    if (ip) runTrace(ip);
    e.target.value = "";
  }
});

window.onload = initMap;
