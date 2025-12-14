"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { lexend } from "@/libs/fonts";

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
      <div className="p-8">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              width={48}
              height={48}
              alt="Company Logo"
              className="rounded-lg shadow-sm"
            />
            <h1 className={`text-2xl font-bold text-gray-800`}>
              Port City Visualization Dashboard
            </h1>
          </div>

          {/* Live Time + Date */}
          <div className="text-right">
            <div className="text-xl font-bold text-gray-800">{currentTime}</div>
            <p className="text-gray-500 text-sm">{currentDate}</p>
          </div>
        </div>

        {/* LIVE Indicator */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-semibold text-gray-700">LIVE</span>
            <span className="text-gray-500 text-sm">
              Map & Data Sync Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
