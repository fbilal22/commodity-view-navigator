
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchOptionsData } from "@/services/optionsApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import OptionsTable from "@/components/OptionsTable";
import { OptionData } from "@/types/options";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Options() {
  const [symbol, setSymbol] = useState("NVDA");
  const [searchInput, setSearchInput] = useState("NVDA");
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase());
    }
  };

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(`Error fetching options data: ${error.message}`);
    }
  }, [isError, error]);

  // Popular stock tickers
  const popularTickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "SPY", "QQQ"];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Options Chain</h1>
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder="Enter symbol (e.g., NVDA)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full md:w-64"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {popularTickers.map(ticker => (
            <Button
              key={ticker}
              variant={ticker === symbol ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSearchInput(ticker);
                setSymbol(ticker);
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
