"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { lexend, amiri } from "@/libs/fonts";

export default function Header() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    };

    updateDateTime(); // Run once at start
    const interval = setInterval(updateDateTime, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup when component unmounts
  }, []);

  return (
    <header className={`${lexend.className} w-full bg-white`}>
      <div className="px-4 lg:px-6 2xl:px-5 pt-4 lg:pt-6 2xl:pt-5 pb-0 lg:pb-0 2xl:pb-0">
        {/* Bismillah */}
        <div className="flex justify-center mb-2">
          <span
            className={`${amiri.className} text-gray-600 font-medium text-2xl lg:text-3xl animate-fade-in-out`}
          >
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </span>
        </div>
        {/* Top Row */}
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3 lg:gap-4 2xl:gap-3">
            <Image
              src="/logo.jpg"
              width={300}
              height={300}
              alt="Company Logo"
              className="2xl:w-20 2xl:h-20"
            />
          </div>

          {/* Live Time + Date */}
          <div className="text-right">
            <div className="text-lg lg:text-xl 2xl:text-lg font-bold text-gray-800">
              {currentTime}
            </div>
            <p className="text-gray-500 text-xs lg:text-sm 2xl:text-xs">
              {currentDate}
            </p>
          </div>
        </div>

        {/* LIVE Indicator */}
        <div className="flex items-center justify-between mt-3 lg:mt-4 2xl:mt-3 pt-2 lg:pt-3 2xl:pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 2xl:w-2.5 2xl:h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-semibold text-gray-700 text-sm lg:text-base 2xl:text-sm">
              LIVE
            </span>
            <span className="text-gray-500 text-xs lg:text-sm 2xl:text-xs">
              Map & Data Sync Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
