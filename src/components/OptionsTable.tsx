
import { useState, useMemo } from "react";
import { OptionData, OptionsViewType } from "@/types/options";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OptionsTableProps {
  optionsData: OptionData[];
  viewType: OptionsViewType;
}

export default function OptionsTable({ optionsData, viewType }: OptionsTableProps) {
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(null);
  const [optionType, setOptionType] = useState<"calls" | "puts">("calls");
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  const [strikePage, setStrikePage] = useState(0);
  
  // Get unique expiration dates
  const expirationDates = useMemo(() => 
    [...new Set(optionsData.map(item => item.expirationDate))].sort(), 
    [optionsData]
  );
  
  // Get unique strike prices
  const strikes = useMemo(() => 
    [...new Set(optionsData.map(item => item.strike))].sort((a, b) => a - b),
    [optionsData]
  );
  
  // If no expiration is selected, use the first one
  const currentExpiration = selectedExpiration || expirationDates[0] || "";
  
  // If no strike is selected, use the middle one
  const currentStrike = selectedStrike || 
    (strikes.length > 0 ? strikes[Math.floor(strikes.length / 2)] : null);
  
  // Filter data based on view type
  const filteredData = useMemo(() => {
    if (viewType === "expiration") {
      return optionsData.filter(item => item.expirationDate === currentExpiration);
    } else {
      return optionsData.filter(item => 
        currentStrike !== null && item.strike === currentStrike
      );
    }
  }, [optionsData, viewType, currentExpiration, currentStrike]);
  
  // Sort by strike price for expiration view, by date for strike view
  const sortedData = useMemo(() => {
    if (viewType === "expiration") {
      return [...filteredData].sort((a, b) => a.strike - b.strike);
    } else {
      return [...filteredData].sort((a, b) => 
        new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
      );
    }
  }, [filteredData, viewType]);

  // Format expiration date for display
  const formatExpirationDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Set up pagination for the strike prices in expiration view
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = viewType === "expiration" 
    ? sortedData.slice(strikePage * itemsPerPage, (strikePage + 1) * itemsPerPage)
    : sortedData;
    
  const handlePreviousPage = () => {
    setStrikePage(prev => Math.max(0, prev - 1));
  };
  
  const handleNextPage = () => {
    setStrikePage(prev => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs value={optionType} onValueChange={(value) => setOptionType(value as "calls" | "puts")}>
          <TabsList>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="puts">Puts</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {viewType === "expiration" && expirationDates.length > 0 && (
          <Select 
            value={currentExpiration} 
            onValueChange={setSelectedExpiration}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select expiration" />
            </SelectTrigger>
            <SelectContent>
              {expirationDates.map(date => (
                <SelectItem key={date} value={date}>
                  {formatExpirationDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {viewType === "strike" && strikes.length > 0 && (
          <Select 
            value={currentStrike?.toString() || ""} 
            onValueChange={(value) => setSelectedStrike(parseFloat(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select strike" />
            </SelectTrigger>
            <SelectContent>
              {strikes.map(strike => (
                <SelectItem key={strike} value={strike.toString()}>
                  {strike.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {viewType === "strike" && <TableHead>Expiration</TableHead>}
              {viewType === "expiration" && <TableHead>Strike</TableHead>}
              <TableHead>Bid</TableHead>
              <TableHead>Ask</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Delta</TableHead>
              <TableHead>Gamma</TableHead>
              <TableHead>Theta</TableHead>
              <TableHead>Vega</TableHead>
              <TableHead>Rho</TableHead>
              <TableHead>IV %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((option) => {
                const isInTheMoney = optionType === "calls" 
                  ? option.call.delta > 0.5 
                  : option.put.delta < -0.5;
                  
                const optionData = optionType === "calls" ? option.call : option.put;
                
                return (
                  <TableRow 
                    key={`${option.expirationDate}-${option.strike}`}
                    className={isInTheMoney 
                      ? optionType === "calls" 
                        ? "bg-green-50 dark:bg-green-950/20" 
                        : "bg-red-50 dark:bg-red-950/20"
                      : ""
                    }
                  >
                    {viewType === "strike" && (
                      <TableCell className="font-medium">{formatExpirationDate(option.expirationDate)}</TableCell>
                    )}
                    {viewType === "expiration" && (
                      <TableCell className="font-medium">{option.strike.toFixed(2)}</TableCell>
                    )}
                    <TableCell>{optionData.bid ? optionData.bid.toFixed(2) : "-"}</TableCell>
                    <TableCell>{optionData.ask ? optionData.ask.toFixed(2) : "-"}</TableCell>
                    <TableCell>{optionData.price.toFixed(2)}</TableCell>
                    <TableCell className={isInTheMoney 
                      ? optionType === "calls"
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                      : ""
                    }>
                      {optionData.delta.toFixed(2)}
                    </TableCell>
                    <TableCell>{optionData.gamma.toFixed(3)}</TableCell>
                    <TableCell>{optionData.theta.toFixed(2)}</TableCell>
                    <TableCell>{optionData.vega.toFixed(2)}</TableCell>
                    <TableCell>{optionData.rho.toFixed(3)}</TableCell>
                    <TableCell>{(optionData.iv * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  No options data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {viewType === "expiration" && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreviousPage}
            disabled={strikePage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm">
            Page {strikePage + 1} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage}
            disabled={strikePage === totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
