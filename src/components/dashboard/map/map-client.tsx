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
import { useEffect, useState, useRef } from "react";

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
    let isMounted = true;

    const fetchCoordinates = async () => {
      // 1. Initial Load from Cache
      const cached = localStorage.getItem("cityCoordinates");
      const cachedCoords: Record<string, [number, number]> = cached
        ? JSON.parse(cached)
        : {};

      let currentCoords = { ...coordinates, ...cachedCoords };

      // Update state immediately with cached values if they are new
      if (
        isMounted &&
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

      // Prioritize selectedCity if it's missing (move to front if exists)
      // Note: We don't filter again here to avoid complex race conditions, just simple re-order
      const selectedIdx = missingCities.indexOf(selectedCity);
      if (selectedIdx > -1) {
        missingCities.splice(selectedIdx, 1);
        missingCities.unshift(selectedCity);
      }

      // 3. Fetch missing cities sequentially
      for (const city of missingCities) {
        if (!isMounted) break;

        try {
          // Check cache again in case of race/updates
          if (currentCoords[city]) continue;

          // Add delay to respect rate limits
          // We wait BEFORE fetching to handle the loop delay cleanly
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (!isMounted) break;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              city
            )}&format=json&limit=1`
          );

          if (!response.ok) {
            // throw new Error("Fetch failed");
            continue;
          }

          const data = await response.json();

          if (isMounted && data && data.length > 0) {
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
        } catch (error) {
          // console.error(`Failed to geocode ${city}:`, error);
        }
      }
    };

    fetchCoordinates();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityData]); // Run only when cityData changes

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
                fillColor: isSelected ? "#e11d48" : "#f43f5e",
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
                      fillColor: "#e11d48",
                    });
                  }
                },
                mouseout: (e) => {
                  if (!isSelected) {
                    e.target.setStyle({
                      radius: 8,
                      fillColor: "#f43f5e",
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
                      color: "#e11d48",
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
      <div className="hidden absolute bottom-3 lg:bottom-4 2xl:bottom-3 left-3 lg:left-4 2xl:left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 lg:p-2.5 2xl:p-2 border border-gray-200 z-[1000]">
        <h4 className="text-[10px] lg:text-xs 2xl:text-[10px] font-semibold text-gray-800 mb-1.5 lg:mb-2 2xl:mb-1.5">
          Port Cities
        </h4>
        <div className="space-y-1 lg:space-y-1.5 2xl:space-y-1">
          <div className="flex items-center gap-1.5 lg:gap-2 2xl:gap-1.5">
            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 2xl:w-2.5 2xl:h-2.5 rounded-full bg-red-600 border border-white shadow"></div>
            <span className="text-[10px] lg:text-xs 2xl:text-[10px] text-gray-600">
              Selected Port
            </span>
          </div>
          <div className="flex items-center gap-1.5 lg:gap-2 2xl:gap-1.5">
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 2xl:w-2 2xl:h-2 rounded-full bg-red-400 border border-white shadow"></div>
            <span className="text-[10px] lg:text-xs 2xl:text-[10px] text-gray-600">
              Other Ports
            </span>
          </div>
        </div>
      </div>

      {/* Active Port Info - Top Right */}
      <div className="hidden absolute top-2 lg:top-3 2xl:top-2 right-2 lg:right-3 2xl:right-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 lg:p-2.5 2xl:p-2 border border-gray-200 min-w-[140px] lg:min-w-[150px] 2xl:min-w-[130px] max-w-[160px] lg:max-w-[170px] 2xl:max-w-[150px] z-[1000] border-l-3 border-l-red-600">
        <div className="flex items-center justify-between mb-1 lg:mb-1.5 2xl:mb-1">
          <div className="flex items-center gap-1 lg:gap-1.5 2xl:gap-1">
            <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 2xl:w-1 2xl:h-1 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[9px] lg:text-[10px] 2xl:text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
              Active Port
            </span>
          </div>
          <div className="text-[9px] lg:text-[10px] 2xl:text-[9px] px-1 lg:px-1.5 2xl:px-1 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
            Selected
          </div>
        </div>
        <h3 className="text-base lg:text-lg 2xl:text-base font-bold text-gray-800 mb-0.5">
          {selectedCity}
        </h3>
        <p className="text-[10px] lg:text-xs 2xl:text-[10px] text-gray-500">
          {agentCount} active agent{agentCount !== 1 ? "s" : ""}
        </p>
        <div className="mt-1.5 lg:mt-2 2xl:mt-1.5 pt-1.5 lg:pt-2 2xl:pt-1.5 border-t border-gray-200">
          <div className="flex items-baseline gap-1 lg:gap-1.5 2xl:gap-1">
            <div className="text-lg lg:text-xl 2xl:text-lg font-bold text-red-600">
              {totalContainers.toLocaleString()}
            </div>
            <div className="text-[9px] lg:text-[10px] 2xl:text-[9px] text-gray-500">
              Total Containers
            </div>
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
