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

  const contentRef = useRef<HTMLDivElement>(null);

  // Dynamic Auto-Rotation & Scrolling Logic
  useEffect(() => {
    if (!isAutoRotating) return;

    let timeoutId: NodeJS.Timeout;
    let animationFrameId: number;
    const startTime = Date.now();
    const startDelay = 2000;
    const endDelay = 3000;
    const pixelsPerSecond = 40; // Adjustable reading speed

    const runAutoScroll = () => {
      if (!contentRef.current) {
        // Fallback if ref not ready
        timeoutId = setTimeout(() => {
          onCityChange((currentIndex + 1) % cityData.length);
        }, 5000);
        return;
      }

      const element = contentRef.current;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll <= 0) {
        // No scrolling needed, just wait standard time
        timeoutId = setTimeout(() => {
          onCityChange((currentIndex + 1) % cityData.length);
        }, 5000);
      } else {
        // Needs scrolling
        const scrollDuration = (maxScroll / pixelsPerSecond) * 1000;
        const totalDuration = startDelay + scrollDuration + endDelay;

        // Set next city trigger
        timeoutId = setTimeout(() => {
          onCityChange((currentIndex + 1) % cityData.length);
        }, totalDuration);

        // Perform smooth linear scroll
        const animateScroll = () => {
          const now = Date.now();
          const elapsed = now - startTime;

          if (elapsed < startDelay) {
            // Waiting period
            element.scrollTop = 0;
            animationFrameId = requestAnimationFrame(animateScroll);
          } else if (elapsed < startDelay + scrollDuration) {
            // Scrolling period
            const scrollProgress = (elapsed - startDelay) / scrollDuration;
            element.scrollTop = scrollProgress * maxScroll;
            animationFrameId = requestAnimationFrame(animateScroll);
          } else {
            // End delay period (hold at bottom)
            element.scrollTop = maxScroll;
            if (elapsed < totalDuration) {
              animationFrameId = requestAnimationFrame(animateScroll);
            }
          }
        };

        animationFrameId = requestAnimationFrame(animateScroll);
      }
    };

    // Small delay to ensure render/layout/animation (0.4s) is complete before measuring
    const initTimeout = setTimeout(runAutoScroll, 600);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initTimeout);
      cancelAnimationFrame(animationFrameId);
    };
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
      <div className="bg-white border-b border-gray-200 px-3 lg:px-4 py-2 lg:py-3">
        <div className="flex items-center justify-between gap-2 lg:gap-3">
          <div className="flex-shrink-0 min-w-0">
            <h2 className="text-sm lg:text-base xl:text-lg font-semibold text-gray-800 truncate">
              Port Container Data
            </h2>
            <div className="flex items-center gap-1.5 lg:gap-2 mt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-[10px] lg:text-xs text-gray-500 whitespace-nowrap">
                  Currently viewing: <strong>{selectedCity}</strong>
                </span>
              </div>
              {!isAutoRotating && (
                <button
                  onClick={handleResumeAutoRotation}
                  className="text-[10px] lg:text-xs px-1.5 lg:px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 whitespace-nowrap"
                >
                  Resume Auto-Rotation
                </button>
              )}
            </div>
          </div>

          {/* Scrollable City Buttons */}
          <div className="flex-1 overflow-hidden min-w-0">
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-1.5 lg:gap-2 overflow-x-auto scrollbar-hide pb-1"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {cityData.map((city, idx) => (
                <button
                  key={city.city}
                  onClick={() => handleCityClick(idx)}
                  className={`flex-shrink-0 px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-md text-[11px] lg:text-xs xl:text-sm font-medium transition-all flex items-center gap-1 ${
                    idx === currentIndex
                      ? "bg-red-600 text-white shadow-sm"
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
            ref={contentRef} // Attached ref here for scrolling
            className="absolute inset-0 overflow-auto p-3 lg:p-4 xl:p-5 scrollbar-hide"
          >
            <div className="mb-3 lg:mb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base lg:text-lg xl:text-xl font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="text-red-600">{currentCity.city}</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </h3>
                  <p className="text-[11px] lg:text-xs xl:text-sm text-gray-500 mt-0.5">
                    {currentCity.agents.length} agents •{" "}
                    {currentCity.agents.reduce((sum, a) => sum + a.total, 0)}{" "}
                    total containers
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] lg:text-xs text-gray-500">
                    Active on Map
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-600 border-2 border-white shadow-lg"></div>
                    <span className="text-[11px] lg:text-xs xl:text-sm font-medium whitespace-nowrap">
                      Selected Port
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-2 lg:px-3 py-2 lg:py-2.5 text-left text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Agent
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-1.5 lg:px-2 py-2 lg:py-2.5 text-center text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wide"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-2 lg:px-3 py-2 lg:py-2.5 text-center text-[10px] lg:text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCity.agents.map((row, i) => (
                    <motion.tr
                      key={row.agent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="hover:bg-red-50 transition-colors"
                    >
                      <td className="px-2 lg:px-3 py-2 lg:py-2.5 font-medium text-gray-800 text-xs lg:text-sm">
                        {row.agent}
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="px-1.5 lg:px-2 py-2 lg:py-2.5 text-center text-xs lg:text-sm text-gray-600"
                        >
                          {row[col.key] === 0 ? (
                            <span className="text-gray-300">0</span>
                          ) : (
                            row[col.key]
                          )}
                        </td>
                      ))}
                      <td className="px-2 lg:px-3 py-2 lg:py-2.5 text-center font-bold text-xs lg:text-sm text-red-600 bg-red-50">
                        {row.total}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-red-50 border-t border-red-100">
                    <td className="px-2 lg:px-3 py-2 lg:py-2.5 font-bold text-gray-800 text-xs lg:text-sm">
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
                          className="px-1.5 lg:px-2 py-2 lg:py-2.5 text-center font-bold text-xs lg:text-sm text-gray-700"
                        >
                          {colSum}
                        </td>
                      );
                    })}
                    <td className="px-2 lg:px-3 py-2 lg:py-2.5 text-center font-bold text-sm lg:text-base xl:text-lg text-red-700 bg-red-100">
                      {currentCity.agents.reduce((sum, a) => sum + a.total, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="bg-white border-t border-gray-200 px-3 lg:px-4 py-2 lg:py-2.5">
        <div className="flex items-center justify-between gap-2 lg:gap-3">
          <div className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
            <div
              className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${
                isAutoRotating ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <span className="text-[10px] lg:text-xs text-gray-600 whitespace-nowrap">
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
                <div
                  key={city.city}
                  className="flex-shrink-0 min-w-[60px] lg:min-w-[70px]"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-[10px] lg:text-xs mb-0.5 lg:mb-1 whitespace-nowrap ${
                        idx === currentIndex
                          ? "font-semibold text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {city.city}
                    </span>
                    <div className="w-full h-1 lg:h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      {idx === currentIndex && (
                        <motion.div
                          className="h-full bg-red-600"
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

          <div className="text-[10px] lg:text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
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
