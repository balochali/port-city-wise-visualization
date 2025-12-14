"use client";

import MapWrapper from "./map/map-wrapper";
import Tables from "./tables";
import { useState } from "react";
import { lexend } from "@/libs/fonts";

export default function Dashboard() {
  const [currentCityIndex, setCurrentCityIndex] = useState(0);

  const sampleData = [
    {
      city: "CHENNAI",
      agents: [
        {
          agent: "GOODRICH",
          values: [31, 28, 0, 0, 1, 1, 0, 0, 1, 0],
          total: 62,
        },
        {
          agent: "KGL",
          values: [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          total: 2,
        },
        {
          agent: "NAVIO",
          values: [16, 51, 13, 10, 3, 0, 2, 0, 0, 0],
          total: 95,
        },
      ],
    },
    {
      city: "KOLKATA",
      agents: [
        {
          agent: "AEGON",
          values: [11, 10, 0, 0, 2, 0, 0, 0, 0, 0],
          total: 23,
        },
        {
          agent: "GOODRICH",
          values: [58, 148, 1, 2, 0, 0, 0, 0, 0, 0],
          total: 209,
        },
      ],
    },
    {
      city: "MUMBAI",
      agents: [
        {
          agent: "SHIPCO",
          values: [45, 32, 5, 2, 8, 1, 0, 0, 2, 1],
          total: 96,
        },
        {
          agent: "MARINE",
          values: [22, 18, 3, 1, 5, 0, 1, 0, 0, 0],
          total: 50,
        },
      ],
    },
    {
      city: "VISAKHAPATNAM",
      agents: [
        {
          agent: "OCEANIC",
          values: [15, 12, 0, 0, 3, 0, 0, 0, 0, 0],
          total: 30,
        },
      ],
    },
  ];

  const currentCity = sampleData[currentCityIndex].city;

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
            cityData={sampleData}
            currentIndex={currentCityIndex}
            onCityChange={setCurrentCityIndex}
            selectedCity={currentCity}
          />
        </div>

        <div className="w-1/3 bg-white shadow-sm rounded-sm border border-gray-100">
          <MapWrapper selectedCity={currentCity} cityData={sampleData} />
        </div>
      </div>
    </div>
  );
}
