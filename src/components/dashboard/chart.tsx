"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { CityBlock } from "@/types/types";
import { lexend } from "@/libs/fonts";
import { CONTAINER_LIMIT } from "@/libs/constants";

interface ChartProps {
  cityData: CityBlock;
}

export default function ContainerChart({ cityData }: ChartProps) {
  const containerTypes = [
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

  const chartData = containerTypes.map((type) => {
    const total = cityData.agents.reduce(
      (sum, agent) =>
        sum + (Number(agent[type.key as keyof typeof agent]) || 0),
      0
    );
    return {
      name: type.label,
      value: total,
    };
  });

  const isAnyOverLimit = chartData.some((d) => d.value > CONTAINER_LIMIT);

  return (
    <div
      className={`${lexend.className} w-full h-full flex flex-col p-3 lg:p-4`}
    >
      <h3 className="text-sm lg:text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isAnyOverLimit ? "animate-flicker" : "bg-red-600"
          }`}
        ></span>
        <span
          className={`transition-colors rounded px-1 ${
            isAnyOverLimit ? "animate-flicker" : ""
          }`}
        >
          Container Type Distribution
        </span>
      </h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              interval={0}
              angle={-45}
              textAnchor="end"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => {
                const isOverLimit = entry.value > CONTAINER_LIMIT;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      isOverLimit
                        ? "#eab308"
                        : entry.value > 0
                        ? "#e11d48"
                        : "#f1f5f9"
                    }
                    className={isOverLimit ? "animate-flicker" : ""}
                  />
                );
              })}
              <LabelList
                dataKey="value"
                position="top"
                offset={10}
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  fill: "#374151",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
