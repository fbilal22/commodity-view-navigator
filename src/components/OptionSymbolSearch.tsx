
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SymbolType = "stock" | "fund etf" | "futures" | "index";

export interface SymbolOption {
  symbol: string;
  name: string;
  type: SymbolType;
  exchange: string;
  countryCode: string;
}

// Sample symbols data based on the screenshot
const popularSymbols: SymbolOption[] = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF TRUST", type: "fund etf", exchange: "NYSE ARCA", countryCode: "US" },
  { symbol: "TSLA", name: "TESLA, INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "ES", name: "E-MINI S&P 500 FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "NQ", name: "E-MINI NASDAQ-100 FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "NVDA", name: "NVIDIA CORPORATION", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "NIFTY", name: "NIFTY 50 INDEX", type: "index", exchange: "NSE", countryCode: "IN" },
  { symbol: "QQQ", name: "INVESCO QQQ TRUST, SERIES 1", type: "fund etf", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "AAPL", name: "APPLE INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "MNQ", name: "MICRO E-MINI NASDAQ-100 INDEX FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "AMZN", name: "AMAZON.COM, INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "META", name: "META PLATFORMS, INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "PLTR", name: "PALANTIR TECHNOLOGIES INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "MES", name: "MICRO E-MINI S&P 500 INDEX FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "MSFT", name: "MICROSOFT CORPORATION", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "GOOGL", name: "ALPHABET INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
];

interface OptionSymbolSearchProps {
  onSelectSymbol: (symbol: string) => void;
  defaultValue?: string;
}

export default function OptionSymbolSearch({ onSelectSymbol, defaultValue = "" }: OptionSymbolSearchProps) {
  const [searchInput, setSearchInput] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"All" | "Stocks" | "Futures" | "Indices">("All");
  const [filteredSymbols, setFilteredSymbols] = useState<SymbolOption[]>(popularSymbols);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter symbols based on search input and active filter
  useEffect(() => {
    let filtered = popularSymbols;
    
    // Filter by text input
    if (searchInput.trim()) {
      const search = searchInput.toLowerCase();
      filtered = filtered.filter(
        sym => sym.symbol.toLowerCase().includes(search) || 
               sym.name.toLowerCase().includes(search)
      );
    }
    
    // Filter by type
    if (activeFilter !== "All") {
      const typeMap: Record<string, SymbolType | SymbolType[]> = {
        "Stocks": "stock",
        "Futures": "futures",
        "Indices": "index"
      };
      const typeFilter = typeMap[activeFilter];
      filtered = filtered.filter(sym => 
        Array.isArray(typeFilter) 
          ? typeFilter.includes(sym.type) 
          : sym.type === typeFilter
      );
    }
    
    setFilteredSymbols(filtered);
  }, [searchInput, activeFilter]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine which country flag to show
  const getCountryFlag = (countryCode: string) => {
    if (countryCode === "US") return "🇺🇸";
    if (countryCode === "IN") return "🇮🇳";
    return "🌐"; // Default flag if country code not recognized
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center w-full border rounded-md bg-background focus-within:ring-1 focus-within:ring-ring">
        <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          placeholder="Search symbol..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="flex h-10 w-full rounded-md border-0 bg-background px-3 py-2 text-sm ring-0 focus-visible:outline-none focus-visible:ring-0"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 mr-1"
            onClick={() => {
              setSearchInput("");
              setIsOpen(true);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center p-2 border-b">
            {["All", "Stocks", "Futures", "Indices"].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                className="text-xs mr-1 h-7 px-2"
                onClick={() => setActiveFilter(filter as any)}
              >
                {filter}
              </Button>
            ))}
          </div>
          
          <div className="max-h-80 overflow-auto p-1">
            {filteredSymbols.length > 0 ? (
              <table className="w-full">
                <tbody>
                  {filteredSymbols.map((symbol) => (
                    <tr
                      key={symbol.symbol}
                      className={cn(
                        "cursor-pointer hover:bg-accent transition-colors",
                        "border-b border-border last:border-0"
                      )}
                      onClick={() => {
                        onSelectSymbol(symbol.symbol);
                        setSearchInput(symbol.symbol);
                        setIsOpen(false);
                      }}
                    >
                      <td className="py-2 pl-2 w-12">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                          {symbol.symbol.slice(0, 2)}
                        </div>
                      </td>
                      <td className="py-2 font-medium">{symbol.symbol}</td>
                      <td className="py-2 text-muted-foreground text-sm">{symbol.name}</td>
                      <td className="py-2 text-right text-xs text-muted-foreground pr-2">
                        <div className="flex items-center justify-end space-x-2">
                          <span>{symbol.type}</span>
                          <span>{symbol.exchange}</span>
                          <span>{getCountryFlag(symbol.countryCode)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No symbols found matching your search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
