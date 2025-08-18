"use client";

import React from "react";
import { ResponsiveLine } from "@nivo/line";
import { avenir } from "@/app/fonts/font";

type Serie = {
  id: string;
  data: { x: string; y: number }[];
};

function generateOrdersData(startDate: string, days: number) {
  const data = [];
  const start = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const orders = (Math.floor(Math.random() * 4) + 1) * 5; // 5,10,15,20
    data.push({
      x: currentDate.toISOString().split("T")[0],
      y: orders,
    });
  }
  return data;
}

const salesData: Serie[] = [
  {
    id: "Orders",
    data: generateOrdersData("2024-12-25", 7),
  },
];

export default function Lines() {
  return (
    <div style={{ height: 350 }}>
      <ResponsiveLine
        data={salesData}
        curve="monotoneX"
        isInteractive={true}
        enableGridX={false}
        margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
        xScale={{
          type: "time",
          format: "%Y-%m-%d",
          useUTC: false,
          precision: "day",
        }}
        xFormat="time:%b %d"
        yScale={{ type: "linear", min: 0, max: 20 }}
        axisBottom={{
          format: "%b %d",
          tickValues: "every 1 day",
          legend: "Date",
          legendOffset: 45,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickValues: [0, 5, 10, 15, 20],
          legend: "Orders",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        colors={["#d1d1d1"]}
        pointSize={3}
        pointColor={{ from: "color", modifiers: [] }}
        pointBorderWidth={2}
        pointBorderColor="#000000"
        useMesh={true}
        layers={[
          "grid",
          "markers",
          "axes",
          "areas",
          "lines",
          "slices",
          "points",
          "legends",
        ]}
        theme={{
          text: {
            fontFamily: avenir.style.fontFamily,
            fontSize: 14, // Increase base font size
            fill: "#333",
          },
          axis: {
            legend: {
              text: {
                fontSize: 14,
                fontWeight: 600,
              },
            },
            ticks: {
              text: {
                fontSize: 12,
                fontWeight: 500,
              },
            },
          },
          tooltip: {
            container: {
              fontSize: 1,
              fontFamily: avenir.style.fontFamily,
            },
          },
        }}
      />
    </div>
  );
}
