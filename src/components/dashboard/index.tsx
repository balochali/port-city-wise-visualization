"use client";

import MapWrapper from "./map/map-wrapper";
import Tables from "./tables";
import ContainerChart from "./chart";
import { useState, useEffect } from "react";
import { lexend } from "@/libs/fonts";
import { CONTAINER_LIMIT } from "@/libs/constants";

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
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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

  const isCityOverLimit =
    portData[currentCityIndex]?.agents.some((agent) => {
      // Check if any specific container type in ANY agent's row?
      // Actually the limit is usually on the column total for the city.
      // Let's calculate column totals.
      const columns = [
        "20GP",
        "40HC",
        "20RF",
        "40RF",
        "20OT",
        "40OT",
        "20FR",
        "40FR",
        "20TK",
        "45HC",
      ];
      return columns.some((col) => {
        const colSum = portData[currentCityIndex].agents.reduce(
          (sum, a) => sum + (Number(a[col as keyof typeof a]) || 0),
          0
        );
        return colSum > CONTAINER_LIMIT;
      });
    }) || false;

  return (
    <div
      className={`${lexend.className} flex flex-col gap-2 lg:gap-3 h-[calc(100vh-9rem)] lg:h-[calc(100vh-11rem)] px-3 lg:px-4 xl:px-5 pb-3 lg:pb-4 xl:pb-5 pt-1 lg:pt-2 bg-gray-50`}
    >
      <div className="max-w-[2400px] mx-auto w-full flex flex-col gap-2 lg:gap-3 flex-1">
        <div className="text-center mb-1">
          <h1 className="text-base lg:text-xl xl:text-2xl font-bold text-gray-800">
            Agent City Wise Summary - Currently Viewing:{" "}
            <span
              className={`transition-colors rounded px-1 ${
                isCityOverLimit ? "animate-flicker" : "text-red-600"
              }`}
            >
              {currentCity}
            </span>
          </h1>
          <p className="text-gray-600 text-xs lg:text-sm xl:text-base">
            Click on any city tab to view detailed container data
          </p>
        </div>

        <div className="flex gap-2 lg:gap-3 xl:gap-4 flex-1 min-h-0">
          <div className="flex-1 min-w-[500px] max-w-[65%]">
            <Tables
              cityData={portData}
              currentIndex={currentCityIndex}
              onCityChange={setCurrentCityIndex}
              selectedCity={currentCity}
            />
          </div>

          <div className="flex-1 min-w-[300px] max-w-[35%] flex flex-col gap-2 lg:gap-3">
            <div className="h-1/2 bg-white shadow-sm rounded-sm border border-gray-100 overflow-hidden">
              <MapWrapper selectedCity={currentCity} cityData={portData} />
            </div>
            <div className="h-1/2 bg-white shadow-sm rounded-sm border border-gray-100 overflow-hidden">
              <ContainerChart cityData={portData[currentCityIndex]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
