// dashboard/table.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CityBlock } from "@/types/types";
import { lexend } from "@/libs/fonts";

interface TablesProps {
  cityData: CityBlock[];
  currentIndex: number;
  onCityChange: (index: number) => void;
  selectedCity: string;
}

export default function Tables({
  cityData,
  currentIndex,
  onCityChange,
  selectedCity,
}: TablesProps) {
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressScrollRef = useRef<HTMLDivElement>(null);

  // Header labels and corresponding keys in data
  const columns: {
    label: string;
    key: keyof Omit<import("@/types/types").AgentData, "agent" | "total">;
  }[] = [
    { label: "20'GP", key: "20GP" },
    { label: "40'HC", key: "40HC" },
    { label: "20'RF", key: "20RF" },
    { label: "40'RF", key: "40RF" },
    { label: "20'OT", key: "20OT" },
    { label: "40'OT", key: "40OT" },
    { label: "20'FR", key: "20FR" },
    { label: "40'FR", key: "40FR" },
    { label: "20'TK", key: "20TK" },
    { label: "45 HC", key: "45HC" },
  ];

  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      onCityChange((currentIndex + 1) % cityData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [cityData.length, currentIndex, onCityChange, isAutoRotating]);

  // Auto-scroll to active city button
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeButton = scrollContainerRef.current.children[
        currentIndex
      ] as HTMLElement;
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex]);

  // Auto-scroll progress bar
  useEffect(() => {
    if (progressScrollRef.current) {
      const activeProgress = progressScrollRef.current.children[
        currentIndex
      ] as HTMLElement;
      if (activeProgress) {
        activeProgress.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex]);

  const currentCity = cityData[currentIndex];

  const fadeVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  const handleCityClick = (index: number) => {
    onCityChange(index);
    setIsAutoRotating(false);
  };

  const handleResumeAutoRotation = () => {
    setIsAutoRotating(true);
  };

  return (
    <div
      className={`${lexend.className} w-full h-full flex flex-col bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden`}
    >
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">
              Port Container Data
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                <span className="text-xs text-gray-500">
                  Currently viewing: <strong>{selectedCity}</strong>
                </span>
              </div>
              {!isAutoRotating && (
                <button
                  onClick={handleResumeAutoRotation}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Resume Auto-Rotation
                </button>
              )}
            </div>
          </div>

          {/* Scrollable City Buttons */}
          <div className="flex-1 overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {cityData.map((city, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCityClick(idx)}
                  className={`flex-shrink-0 px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                    idx === currentIndex
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {city.city}
                  {city.city === selectedCity && idx !== currentIndex && (
                    <span className="w-1 h-1 rounded-full bg-white"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
            className="absolute inset-0 overflow-auto p-6"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-blue-600">{currentCity.city}</span>
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentCity.agents.length} agents •{" "}
                    {currentCity.agents.reduce((sum, a) => sum + a.total, 0)}{" "}
                    total containers
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Active on Map</div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
                    <span className="text-sm font-medium">Selected Port</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Agent
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCity.agents.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                        {row.agent}
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="px-3 py-3 text-center text-sm text-gray-600"
                        >
                          {row[col.key] === 0 ? (
                            <span className="text-gray-300">0</span>
                          ) : (
                            row[col.key]
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center font-bold text-sm text-blue-600 bg-blue-50">
                        {row.total}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 border-t border-blue-100">
                    <td className="px-4 py-3 font-bold text-gray-800 text-sm">
                      City Total
                    </td>
                    {columns.map((col) => {
                      const colSum = currentCity.agents.reduce(
                        (sum, agent) => sum + (agent[col.key] || 0),
                        0
                      );
                      return (
                        <td
                          key={col.key}
                          className="px-3 py-3 text-center font-bold text-sm text-gray-700"
                        >
                          {colSum}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center font-bold text-lg text-blue-700 bg-blue-100">
                      {currentCity.agents.reduce((sum, a) => sum + a.total, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`w-2 h-2 rounded-full ${
                isAutoRotating ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {isAutoRotating
                ? "Auto-rotating every 5s"
                : "Auto-rotation paused"}
            </span>
          </div>

          {/* Scrollable Progress Bar */}
          <div className="flex-1 overflow-hidden">
            <div
              ref={progressScrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {cityData.map((city, idx) => (
                <div key={idx} className="flex-shrink-0 min-w-[80px]">
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-xs mb-1 whitespace-nowrap ${
                        idx === currentIndex
                          ? "font-semibold text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {city.city}
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      {idx === currentIndex && (
                        <motion.div
                          className="h-full bg-blue-600"
                          initial={{ width: "0%" }}
                          animate={{ width: isAutoRotating ? "100%" : "100%" }}
                          transition={{
                            duration: isAutoRotating ? 5 : 0,
                            ease: "linear",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
            {currentIndex + 1} of {cityData.length}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
