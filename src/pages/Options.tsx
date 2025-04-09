
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchOptionsData } from "@/services/optionsApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import OptionsTable from "@/components/OptionsTable";
import OptionsStrikeChart from "@/components/OptionsStrikeChart";
import { OptionData } from "@/types/options";

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Options Dashboard</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter symbol (e.g., NVDA)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-64"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </div>

        <div className="bg-card rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{symbol} Options Chain</h2>
            <Tabs value={viewType} onValueChange={(v) => setViewType(v as "expiration" | "strike")}>
              <TabsList>
                <TabsTrigger value="expiration">Par expiration</TabsTrigger>
                <TabsTrigger value="strike">Par strike</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : isError ? (
            <div className="text-center p-8 text-red-500">
              <p>Failed to load options data. Please try again.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <OptionsStrikeChart optionsData={optionsData || []} />
              </div>
              <OptionsTable 
                optionsData={optionsData || []} 
                viewType={viewType} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
