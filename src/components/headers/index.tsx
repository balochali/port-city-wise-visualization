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
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/logo.svg"
              width={600}
              height={300}
              alt="Company Logo"
              priority
              className="w-28 lg:w-40 2xl:w-48 min-[1920px]:w-64 min-[3840px]:w-80 h-auto object-contain"
            />
          </div>

          {/* Bismillah Video */}
          <div className="flex-1 flex justify-center -mt-4 lg:-mt-6 2xl:-mt-8">
            <video
              src="/bismillah.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-48 lg:w-72 2xl:w-80 min-[1920px]:w-[28rem] min-[3840px]:w-[36rem] h-auto object-contain mix-blend-multiply"
            />
          </div>

          {/* Live Time + Date */}
          <div className="text-right flex-shrink-0">
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
