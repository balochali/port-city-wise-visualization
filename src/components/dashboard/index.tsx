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
          "20GP": 31,
          "40HC": 28,
          "20RF": 0,
          "40RF": 0,
          "20OT": 1,
          "40OT": 1,
          "20FR": 0,
          "40FR": 0,
          "20TK": 1,
          "45HC": 0,
          total: 62,
        },
        {
          agent: "KGL",
          "20GP": 0,
          "40HC": 2,
          "20RF": 0,
          "40RF": 0,
          "20OT": 0,
          "40OT": 0,
          "20FR": 0,
          "40FR": 0,
          "20TK": 0,
          "45HC": 0,
          total: 2,
        },
        {
          agent: "NAVIO",
          "20GP": 16,
          "40HC": 51,
          "20RF": 13,
          "40RF": 10,
          "20OT": 3,
          "40OT": 0,
          "20FR": 2,
          "40FR": 0,
          "20TK": 0,
          "45HC": 0,
          total: 95,
        },
      ],
    },
    {
      city: "KOLKATA",
      agents: [
        {
          agent: "AEGON",
          "20GP": 11,
          "40HC": 10,
          "20RF": 0,
          "40RF": 0,
          "20OT": 2,
          "40OT": 0,
          "20FR": 0,
          "40FR": 0,
          "20TK": 0,
          "45HC": 0,
          total: 23,
        },
        {
          agent: "GOODRICH",
          "20GP": 58,
          "40HC": 148,
          "20RF": 1,
          "40RF": 2,
          "20OT": 0,
          "40OT": 0,
          "20FR": 0,
          "40FR": 0,
          "20TK": 0,
          "45HC": 0,
          total: 209,
        },
      ],
    },
    {
      city: "MUMBAI",
      agents: [
        {
          agent: "SHIPCO",
          "20GP": 45,
          "40HC": 32,
          "20RF": 5,
          "40RF": 2,
          "20OT": 8,
          "40OT": 1,
          "20FR": 0,
          "40FR": 0,
          "20TK": 2,
          "45HC": 1,
          total: 96,
        },
        {
          agent: "MARINE",
          "20GP": 22,
          "40HC": 18,
          "20RF": 3,
          "40RF": 1,
          "20OT": 5,
          "40OT": 0,
          "20FR": 1,
          "40FR": 0,
          "20TK": 0,
          "45HC": 0,
          total: 50,
        },
      ],
    },
    {
      city: "VISAKHAPATNAM",
      agents: [
        {
          agent: "OCEANIC",
          "20GP": 15,
          "40HC": 12,
          "20RF": 0,
          "40RF": 0,
          "20OT": 3,
          "40OT": 0,
          "20FR": 0,
          "40FR": 0,
          "20TK": 0,
          "45HC": 0,
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
