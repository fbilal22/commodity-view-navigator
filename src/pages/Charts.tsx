
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import FinlogixChart from "@/components/FinlogixChart";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const Charts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [symbolName, setSymbolName] = useState("Gold");
  const [chartShape, setChartShape] = useState<"candles" | "line">("candles");
  const [timePeriod, setTimePeriod] = useState("D1");
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Add a key to force remount the chart component
  const [chartKey, setChartKey] = useState(0);

  // When the component mounts, show a toast to let the user know about the chart
  useEffect(() => {
    toast({
      title: "Financial Charts",
      description: "Use the settings above to customize the chart display",
    });
  }, [toast]);

  const refreshChart = () => {
    setIsRefreshing(true);
    // Increment the key to force a remount of the chart component
    setChartKey(prev => prev + 1);
    
    // Show a toast to indicate refresh
    toast({
      title: "Refreshing chart",
      description: `Loading ${symbolName} chart data...`,
    });
    
    // Reset the refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Charts</h1>
            <p className="text-muted-foreground">
              Interactive market data visualization
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refreshChart}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin mr-2" : "mr-2"} />
          Refresh
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chart Settings</CardTitle>
          <CardDescription>Customize the chart display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Symbol</label>
              <Select value={symbolName} onValueChange={(value) => {
                setSymbolName(value);
                refreshChart();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Copper">Copper</SelectItem>
                  <SelectItem value="Apple">Apple</SelectItem>
                  <SelectItem value="Tesla">Tesla</SelectItem>
                  <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type</label>
              <Select value={chartShape} onValueChange={(value: "candles" | "line") => {
                setChartShape(value);
                refreshChart();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candles">Candlestick</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={timePeriod} onValueChange={(value) => {
                setTimePeriod(value);
                refreshChart();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D1">1 Day</SelectItem>
                  <SelectItem value="W1">1 Week</SelectItem>
                  <SelectItem value="M1">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{symbolName} Chart</CardTitle>
          <CardDescription>
            {chartShape === "candles" ? "Candlestick" : "Line"} chart with {timePeriod} timeframe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[600px] rounded-md overflow-hidden border">
            <FinlogixChart 
              key={chartKey}
              symbolName={symbolName}
              chartShape={chartShape}
              timePeriod={timePeriod}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Charts;
