"use client";

import MapWrapper from "./map/map-wrapper";
import Tables from "./tables";
import { useState, useEffect } from "react";
import { lexend } from "@/libs/fonts";

export default function Dashboard() {
  const [currentCityIndex, setCurrentCityIndex] = useState(0);

  const [portData, setPortData] = useState<import("@/types/types").CityBlock[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await fetch("/api/ports");
        const data = await response.json();
        if (data.success) {
          setPortData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch port data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-11rem)] flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (portData.length === 0) {
    return (
      <div className="h-[calc(100vh-11rem)] flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <p className="text-lg font-medium">No Data Available</p>
        <p className="text-sm">Please upload data from the admin panel.</p>
      </div>
    );
  }

  const currentCity = portData[currentCityIndex]?.city || "";

  return (
    <div
      className={`${lexend.className} flex flex-col gap-4 h-[calc(100vh-11rem)] p-8 bg-gray-50`}
    >
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">
          Shipping Dashboard - Currently Viewing:{" "}
          <span className="text-blue-600">{currentCity}</span>
        </h1>
        <p className="text-gray-600">
          Click on any city tab to view detailed container data
        </p>
      </div>

      <div className="flex gap-4 flex-1">
        <div className="w-2/3">
          <Tables
            cityData={portData}
            currentIndex={currentCityIndex}
            onCityChange={setCurrentCityIndex}
            selectedCity={currentCity}
          />
        </div>

        <div className="w-1/3 bg-white shadow-sm rounded-sm border border-gray-100">
          <MapWrapper selectedCity={currentCity} cityData={portData} />
        </div>
      </div>
    </div>
  );
}
