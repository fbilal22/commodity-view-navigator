
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchOptionsData } from "@/services/optionsApi";
import { Button } from "@/components/ui/button";
import OptionsTable from "@/components/OptionsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import OptionSymbolSearch from "@/components/OptionSymbolSearch";

export default function Options() {
  const [symbol, setSymbol] = useState("NVDA");
  const [viewType, setViewType] = useState<"expiration" | "strike">("expiration");

  const {
    data: optionsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["optionsData", symbol],
    queryFn: () => fetchOptionsData(symbol),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Popular stock tickers
  const popularTickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "SPY", "QQQ"];

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(`Error fetching options data: ${error.message}`);
    }
  }, [isError, error]);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Options Chain</h1>
          <div className="w-full md:w-2/3 lg:w-1/2">
            <OptionSymbolSearch 
              onSelectSymbol={(selectedSymbol) => {
                setSymbol(selectedSymbol);
                toast.success(`Loading options for ${selectedSymbol}`);
              }}
              defaultValue={symbol}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {popularTickers.map(ticker => (
            <Button
              key={ticker}
              variant={ticker === symbol ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSymbol(ticker);
                toast.success(`Loading options for ${ticker}`);
              }}
            >
              {ticker}
            </Button>
          ))}
        </div>

        <Card className="bg-card rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{symbol} Options Chain</h2>
            <div className="flex gap-2">
              <Button 
                variant={viewType === "expiration" ? "default" : "outline"}
                onClick={() => setViewType("expiration")}
                size="sm"
              >
                By Expiration
              </Button>
              <Button 
                variant={viewType === "strike" ? "default" : "outline"}
                onClick={() => setViewType("strike")}
                size="sm"
              >
                By Strike
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : isError ? (
            <div className="text-center p-8 text-red-500">
              <p>Failed to load options data. Please try again.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : (
            <OptionsTable 
              optionsData={optionsData || []} 
              viewType={viewType} 
            />
          )}
        </Card>
      </div>
    </div>
  );
}
