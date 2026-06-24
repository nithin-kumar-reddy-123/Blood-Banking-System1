import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const cacheKey = "geocode_cache";
const getGeocodeCache = () => JSON.parse(localStorage.getItem(cacheKey) || "{}");
const setGeocodeCache = (cache) => localStorage.setItem(cacheKey, JSON.stringify(cache));

// Fit the map to all markers only once when they first load
const FitBoundsOnce = ({ markers }) => {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (!hasFit.current && markers.length > 0) {
      const bounds = markers.map((m) => [m.lat, m.lon]);
      if (bounds.length === 1) {
        map.setView(bounds[0], 10, { animate: false });
      } else {
        map.fitBounds(bounds, { padding: [40, 40], animate: false });
      }
      hasFit.current = true;
    }
  }, [markers, map]);

  return null;
};

const MapWrapper = ({ items, itemType = "donor" }) => {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Reset fit when items list changes (e.g. search filter applied)
    setMarkers([]);
  }, [items]);

  useEffect(() => {
    let cancelled = false;

    const geocodeItems = async () => {
      const cache = getGeocodeCache();
      const newMarkers = [];
      let updatedCache = false;

      // Deduplicate locations so we don't geocode the same city twice
      const seen = new Set();

      for (const item of items) {
        if (!item.location) continue;

        const locString = item.location.trim().toLowerCase();

        if (cache[locString]) {
          newMarkers.push({ ...item, lat: cache[locString].lat, lon: cache[locString].lon });
        } else if (!seen.has(locString)) {
          seen.add(locString);
          try {
            // Respect Nominatim usage policy: max 1 req/sec
            await new Promise((r) => setTimeout(r, 1000));
            if (cancelled) return;

            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.location)}&limit=1`,
              { headers: { "Accept-Language": "en" } }
            );
            const data = await response.json();

            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
              cache[locString] = { lat, lon };
              updatedCache = true;
              newMarkers.push({ ...item, lat, lon });
            }
          } catch (err) {
            console.error(`Failed to geocode: ${item.location}`, err);
          }
        } else if (cache[locString]) {
          // Already geocoded this run via dedup
          newMarkers.push({ ...item, lat: cache[locString].lat, lon: cache[locString].lon });
        }
      }

      if (cancelled) return;

      if (updatedCache) {
        setGeocodeCache(cache);
      }

      setMarkers(newMarkers);
    };

    geocodeItems();

    return () => {
      cancelled = true;
    };
  }, [items]);

  // Default center: India
  const defaultCenter = [20.5937, 78.9629];

  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        marginBottom: "30px",
        zIndex: 1,
        position: "relative",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        // Prevent the map from re-rendering when parent re-renders
        key="stable-map"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FitBoundsOnce markers={markers} />
        {markers.map((marker, idx) => (
          <Marker key={idx} position={[marker.lat, marker.lon]}>
            <Popup>
              <strong style={{ color: "#000" }}>{marker.name}</strong>
              <br />
              <span style={{ color: "#444" }}>
                {marker.bloodGroup && (
                  <>
                    🩸 <b>{marker.bloodGroup}</b>
                    <br />
                  </>
                )}
                📍 {marker.location}
                {marker.phone && (
                  <>
                    <br />
                    📞 {marker.phone}
                  </>
                )}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapWrapper;
