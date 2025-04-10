
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SymbolType = "stock" | "futures" | "index" | "fund etf";

export interface SymbolOption {
  symbol: string;
  name: string;
  type: SymbolType;
  exchange: string;
  countryCode: string;
}

// Expanded symbols list based on TradingView
const tradingViewSymbols: SymbolOption[] = [
  // Stocks
  { symbol: "TSLA", name: "TESLA, INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "NVDA", name: "NVIDIA CORPORATION", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "AAPL", name: "APPLE INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "AMZN", name: "AMAZON.COM, INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "META", name: "META PLATFORMS, INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "PLTR", name: "PALANTIR TECHNOLOGIES INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "MSTR", name: "MICROSTRATEGY INCORPORATED", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "MSFT", name: "MICROSOFT CORPORATION", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "AMD", name: "ADVANCED MICRO DEVICES, INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "GOOGL", name: "ALPHABET INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "NFLX", name: "NETFLIX, INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "GOOG", name: "ALPHABET INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "INTC", name: "INTEL CORPORATION", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "PYPL", name: "PAYPAL HOLDINGS, INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "CSCO", name: "CISCO SYSTEMS, INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "ADBE", name: "ADOBE INC.", type: "stock", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "BABA", name: "ALIBABA GROUP HOLDING LIMITED", type: "stock", exchange: "NYSE", countryCode: "US" },
  { symbol: "JPM", name: "JPMORGAN CHASE & CO.", type: "stock", exchange: "NYSE", countryCode: "US" },
  { symbol: "V", name: "VISA INC.", type: "stock", exchange: "NYSE", countryCode: "US" },
  { symbol: "DIS", name: "THE WALT DISNEY COMPANY", type: "stock", exchange: "NYSE", countryCode: "US" },
  
  // Futures
  { symbol: "ES", name: "E-MINI S&P 500 FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "NQ", name: "E-MINI NASDAQ-100 FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "MNQ", name: "MICRO E-MINI NASDAQ-100 INDEX FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "MES", name: "MICRO E-MINI S&P 500 INDEX FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "GC", name: "GOLD FUTURES", type: "futures", exchange: "COMEX", countryCode: "US" },
  { symbol: "YM", name: "E-MINI DOW ($5) FUTURES", type: "futures", exchange: "CBOT", countryCode: "US" },
  { symbol: "CL", name: "CRUDE OIL FUTURES", type: "futures", exchange: "NYMEX", countryCode: "US" },
  { symbol: "RTY", name: "E-MINI RUSSELL 2000 INDEX FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "SI", name: "SILVER FUTURES", type: "futures", exchange: "COMEX", countryCode: "US" },
  { symbol: "ZB", name: "U.S. TREASURY BOND FUTURES", type: "futures", exchange: "CBOT", countryCode: "US" },
  { symbol: "HG", name: "COPPER FUTURES", type: "futures", exchange: "COMEX", countryCode: "US" },
  { symbol: "NG", name: "HENRY HUB NATURAL GAS FUTURES", type: "futures", exchange: "NYMEX", countryCode: "US" },
  { symbol: "ZC", name: "CORN FUTURES", type: "futures", exchange: "CBOT", countryCode: "US" },
  { symbol: "ZS", name: "SOYBEAN FUTURES", type: "futures", exchange: "CBOT", countryCode: "US" },
  { symbol: "ZW", name: "WHEAT FUTURES", type: "futures", exchange: "CBOT", countryCode: "US" },
  { symbol: "6E", name: "EURO FX FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "6B", name: "BRITISH POUND FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  { symbol: "6J", name: "JAPANESE YEN FUTURES", type: "futures", exchange: "CME", countryCode: "US" },
  
  // Indices
  { symbol: "NIFTY", name: "NIFTY 50 INDEX", type: "index", exchange: "NSE", countryCode: "IN" },
  { symbol: "BANKNIFTY", name: "NIFTY BANK INDEX", type: "index", exchange: "NSE", countryCode: "IN" },
  { symbol: "NDX", name: "NASDAQ 100 INDEX", type: "index", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "VIX", name: "CBOE VOLATILITY INDEX", type: "index", exchange: "CBOE", countryCode: "US" },
  { symbol: "SENSEX", name: "S&P BSE SENSEX INDEX", type: "index", exchange: "BSE", countryCode: "IN" },
  { symbol: "SPX", name: "S&P 500 INDEX", type: "index", exchange: "CBOE", countryCode: "US" },
  { symbol: "CNXFINANCE", name: "NIFTY FINANCIAL SERVICES INDEX", type: "index", exchange: "NSE", countryCode: "IN" },
  { symbol: "NIFTY_MID_SELECT", name: "NIFTY MIDCAP SELECT INDEX", type: "index", exchange: "NSE", countryCode: "IN" },
  { symbol: "XSP", name: "S&P 500 MINI SPX OPTIONS INDEX", type: "index", exchange: "CBOE", countryCode: "US" },
  { symbol: "RUT", name: "RUSSELL 2000 INDEX", type: "index", exchange: "CBOE/FTSE", countryCode: "US" },
  { symbol: "XAU", name: "PHLX GOLD AND SILVER SECTOR INDEX", type: "index", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "BKX", name: "KBW NASDAQ BANK INDEX", type: "index", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "DJI", name: "DOW JONES INDUSTRIAL AVERAGE", type: "index", exchange: "DJ", countryCode: "US" },
  { symbol: "IXIC", name: "NASDAQ COMPOSITE INDEX", type: "index", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "HSI", name: "HANG SENG INDEX", type: "index", exchange: "HKEX", countryCode: "HK" },
  { symbol: "N225", name: "NIKKEI 225 INDEX", type: "index", exchange: "JPX", countryCode: "JP" },
  
  // ETFs
  { symbol: "SPY", name: "SPDR S&P 500 ETF TRUST", type: "fund etf", exchange: "NYSE ARCA", countryCode: "US" },
  { symbol: "QQQ", name: "INVESCO QQQ TRUST, SERIES 1", type: "fund etf", exchange: "NASDAQ", countryCode: "US" },
  { symbol: "IWM", name: "ISHARES RUSSELL 2000 ETF", type: "fund etf", exchange: "NYSE ARCA", countryCode: "US" },
  { symbol: "EEM", name: "ISHARES MSCI EMERGING MARKETS ETF", type: "fund etf", exchange: "NYSE ARCA", countryCode: "US" },
  { symbol: "XLF", name: "FINANCIAL SELECT SECTOR SPDR FUND", type: "fund etf", exchange: "NYSE ARCA", countryCode: "US" },
  { symbol: "GLD", name: "SPDR GOLD SHARES", type: "fund etf", exchange: "NYSE ARCA", countryCode: "US" },
  { symbol: "VXX", name: "IPATH SERIES B S&P 500 VIX SHORT-TERM FUTURES ETN", type: "fund etf", exchange: "BATS", countryCode: "US" },
];

interface OptionSymbolSearchProps {
  onSelectSymbol: (symbol: string) => void;
  defaultValue?: string;
}

export default function OptionSymbolSearch({ onSelectSymbol, defaultValue = "" }: OptionSymbolSearchProps) {
  const [searchInput, setSearchInput] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"All" | "Stocks" | "Futures" | "Indices">("All");
  const [filteredSymbols, setFilteredSymbols] = useState<SymbolOption[]>(tradingViewSymbols);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter symbols based on search input and active filter
  useEffect(() => {
    let filtered = tradingViewSymbols;
    
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
    if (countryCode === "HK") return "🇭🇰";
    if (countryCode === "JP") return "🇯🇵";
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
