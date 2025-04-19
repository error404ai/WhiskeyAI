"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartData = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartOptions = Record<string, any>;

type ChartContainerProps = {
  /** Type of chart to render */
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  /** Chart data */
  data: ChartData;
  /** Chart options (optional) */
  options?: ChartOptions;
  /** Height of chart (default: 100%) */
  height?: string | number;
  /** Width of chart (default: 100%) */
  width?: string | number;
};

export function ChartContainer({
  type,
  data,
  options = {},
  height = "100%",
  width = "100%",
}: ChartContainerProps) {
  // Add default options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };

  // Render the appropriate chart type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        // @ts-expect-error - Type issues with chart.js
        return <Bar data={data} options={mergedOptions} />;
      case 'line':
        // @ts-expect-error - Type issues with chart.js
        return <Line data={data} options={mergedOptions} />;
      case 'pie':
        // @ts-expect-error - Type issues with chart.js
        return <Pie data={data} options={mergedOptions} />;
      case 'doughnut':
        // @ts-expect-error - Type issues with chart.js
        return <Doughnut data={data} options={mergedOptions} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div style={{ height, width }}>
      {renderChart()}
    </div>
  );
} 