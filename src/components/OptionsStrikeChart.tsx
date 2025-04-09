
import { useMemo } from "react";
import { OptionData } from "@/types/options";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface OptionsStrikeChartProps {
  optionsData: OptionData[];
}

export default function OptionsStrikeChart({ optionsData }: OptionsStrikeChartProps) {
  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!optionsData || optionsData.length === 0) return [];
    
    // Group by expiration date for simplicity
    const grouped = optionsData.reduce<Record<string, OptionData[]>>((acc, option) => {
      if (!acc[option.expirationDate]) {
        acc[option.expirationDate] = [];
      }
      acc[option.expirationDate].push(option);
      return acc;
    }, {});
    
    // Use the first expiration date
    const firstExpiration = Object.keys(grouped)[0];
    if (!firstExpiration) return [];
    
    // Map to chart format
    return grouped[firstExpiration].map(option => ({
      strike: option.strike,
      callDelta: option.call.delta,
      putDelta: Math.abs(option.put.delta), // Use absolute value for better visualization
      callPrice: option.call.price,
      putPrice: option.put.price,
    }));
  }, [optionsData]);

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-muted/10 rounded-lg">
        <p className="text-muted-foreground">No data available for chart</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="strike" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value, name) => {
              if (name === "callDelta" || name === "putDelta") {
                return [Number(value).toFixed(2), name === "callDelta" ? "Call Delta" : "Put Delta"];
              }
              return [Number(value).toFixed(2), name === "callPrice" ? "Call Price" : "Put Price"];
            }}
          />
          <Legend formatter={(value) => {
            switch (value) {
              case "callDelta": return "Call Delta";
              case "putDelta": return "Put Delta";
              case "callPrice": return "Call Price";
              case "putPrice": return "Put Price";
              default: return value;
            }
          }} />
          <Bar yAxisId="left" dataKey="callPrice" fill="#4ade80" />
          <Bar yAxisId="left" dataKey="putPrice" fill="#f87171" />
          <Bar yAxisId="right" dataKey="callDelta" fill="#22c55e" />
          <Bar yAxisId="right" dataKey="putDelta" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
