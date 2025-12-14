"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CityBlock } from "@/types/types";
import { lexend } from "@/libs/fonts";
import { useEffect, useState } from "react";

/* -----------------------------
   Fly to selected city
-------------------------------- */
function FlyToCity({
  selectedCity,
  coordinates,
}: {
  selectedCity: string;
  coordinates: Record<string, [number, number]>;
}) {
  const map = useMap();

  useEffect(() => {
    const coords = coordinates[selectedCity];
    if (coords) {
      map.flyTo(coords, 7, { duration: 1.5 });
    }
  }, [selectedCity, coordinates, map]);

  return null;
}

/* -----------------------------
   Map Component
-------------------------------- */
export default function MapClient({
  selectedCity,
  cityData,
}: {
  selectedCity: string;
  cityData: CityBlock[];
}) {
  const [coordinates, setCoordinates] = useState<
    Record<string, [number, number]>
  >({});
  const activePortData = cityData.find((c) => c.city === selectedCity);
  const agentCount = activePortData?.agents.length || 0;
  const totalContainers =
    activePortData?.agents.reduce((sum, a) => sum + a.total, 0) || 0;

  // Fetch coordinates for all cities
  useEffect(() => {
    const fetchCoordinates = async () => {
      // 1. Initial Load from Cache
      const cached = localStorage.getItem("cityCoordinates");
      const cachedCoords: Record<string, [number, number]> = cached
        ? JSON.parse(cached)
        : {};

      let currentCoords = { ...coordinates, ...cachedCoords };

      // Update state immediately with cached values if they are new
      if (
        Object.keys(cachedCoords).length > 0 &&
        Object.keys(coordinates).length === 0
      ) {
        setCoordinates(currentCoords);
      }

      // 2. Identify missing cities
      const missingCities = cityData
        .map((c) => c.city)
        .filter((city) => !currentCoords[city]);

      if (missingCities.length === 0) return;

      // Prioritize selectedCity if it's missing
      if (missingCities.includes(selectedCity)) {
        missingCities.splice(missingCities.indexOf(selectedCity), 1);
        missingCities.unshift(selectedCity);
      }

      // 3. Fetch missing cities sequentially
      for (const city of missingCities) {
        try {
          // Check cache again in case of race/updates
          if (currentCoords[city]) continue;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              city
            )}&format=json&limit=1`
          );
          const data = await response.json();

          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            // Update local tracking
            currentCoords[city] = [lat, lon];
            cachedCoords[city] = [lat, lon];

            // Update State Incrementally
            setCoordinates((prev) => ({
              ...prev,
              [city]: [lat, lon],
            }));

            // Update Cache
            localStorage.setItem(
              "cityCoordinates",
              JSON.stringify(cachedCoords)
            );
          }

          // Delay to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to geocode ${city}:`, error);
        }
      }
    };

    fetchCoordinates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityData, selectedCity]); // Add selectedCity to dependencies to prioritize it check

  return (
    <div className={`${lexend.className} relative w-full h-full`}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="w-full h-full rounded-sm"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        <FlyToCity selectedCity={selectedCity} coordinates={coordinates} />

        {cityData.map((cityBlock) => {
          const coords = coordinates[cityBlock.city];
          if (!coords) return null;

          const isSelected = cityBlock.city === selectedCity;
          const totalContainers = cityBlock.agents.reduce(
            (sum, agent) => sum + agent.total,
            0
          );

          return (
            <CircleMarker
              key={cityBlock.city}
              center={coords}
              radius={isSelected ? 12 : 8}
              pathOptions={{
                fillColor: isSelected ? "#3b82f6" : "#60a5fa",
                color: "#fff",
                weight: isSelected ? 3 : 2,
                opacity: 1,
                fillOpacity: isSelected ? 0.8 : 0.6,
              }}
              eventHandlers={{
                mouseover: (e) => {
                  if (!isSelected) {
                    e.target.setStyle({
                      radius: 10,
                      fillColor: "#3b82f6",
                    });
                  }
                },
                mouseout: (e) => {
                  if (!isSelected) {
                    e.target.setStyle({
                      radius: 8,
                      fillColor: "#60a5fa",
                    });
                  }
                },
              }}
            >
              <Popup>
                <div
                  style={{
                    padding: "4px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      margin: "0 0 4px 0",
                      color: "#1f2937",
                    }}
                  >
                    {cityBlock.city}
                  </h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                    {cityBlock.agents.length} agents
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#2563eb",
                    }}
                  >
                    {totalContainers} containers
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend - Bottom Left */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200 z-[1000]">
        <h4 className="text-xs font-semibold text-gray-800 mb-2">
          Port Cities
        </h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow"></div>
            <span className="text-xs text-gray-600">Selected Port</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 border border-white shadow"></div>
            <span className="text-xs text-gray-600">Other Ports</span>
          </div>
        </div>
      </div>

      {/* Active Port Info - Top Right (Made Smaller) */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200 min-w-[160px] max-w-[180px] z-[1000] border-l-3 border-l-blue-600">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
              Active Port
            </span>
          </div>
          <div className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
            Selected
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-0.5">
          {selectedCity}
        </h3>
        <p className="text-xs text-gray-500">
          {agentCount} active agent{agentCount !== 1 ? "s" : ""}
        </p>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-baseline gap-1.5">
            <div className="text-xl font-bold text-blue-600">
              {totalContainers.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500">Total Containers</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }

        .leaflet-popup-content {
          margin: 8px;
        }

        .leaflet-marker-icon,
        .leaflet-marker-shadow {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}
