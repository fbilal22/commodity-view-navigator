
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

interface OptionsTableProps {
  optionsData: OptionData[];
  viewType: OptionsViewType;
}

export default function OptionsTable({ optionsData, viewType }: OptionsTableProps) {
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(null);
  const [optionType, setOptionType] = useState<"calls" | "puts">("calls");
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  
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
                  {date}
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
            {sortedData.length > 0 ? (
              sortedData.map((option) => (
                <TableRow 
                  key={`${option.expirationDate}-${option.strike}`}
                  className={
                    optionType === "calls" 
                      ? option.call.delta > 0.5 ? "bg-green-50 dark:bg-green-950/20" : ""
                      : option.put.delta < -0.5 ? "bg-red-50 dark:bg-red-950/20" : ""
                  }
                >
                  {viewType === "strike" && (
                    <TableCell className="font-medium">{option.expirationDate}</TableCell>
                  )}
                  {viewType === "expiration" && (
                    <TableCell className="font-medium">{option.strike.toFixed(2)}</TableCell>
                  )}
                  <TableCell>
                    {optionType === "calls" 
                      ? option.call.bid.toFixed(2) 
                      : option.put.bid.toFixed(2)
                    }
                  </TableCell>
                  <TableCell>
                    {optionType === "calls" 
                      ? option.call.ask.toFixed(2) 
                      : option.put.ask.toFixed(2)
                    }
                  </TableCell>
                  <TableCell>
                    {optionType === "calls" 
                      ? option.call.price.toFixed(2) 
                      : option.put.price.toFixed(2)
                    }
                  </TableCell>
                  <TableCell className={
                    optionType === "calls"
                      ? option.call.delta > 0.5 ? "text-green-600 dark:text-green-400" : ""
                      : option.put.delta < -0.5 ? "text-red-600 dark:text-red-400" : ""
                  }>
                    {optionType === "calls" 
                      ? option.call.delta.toFixed(2) 
                      : option.put.delta.toFixed(2)
                    }
                  </TableCell>
                  <TableCell>
                    {optionType === "calls" 
                      ? option.call.gamma.toFixed(3) 
                      : option.put.gamma.toFixed(3)
                    }
                  </TableCell>
                  <TableCell>
                    {optionType === "calls" 
                      ? option.call.theta.toFixed(2) 
                      : option.put.theta.toFixed(2)
                    }
                  </TableCell>
                  <TableCell>
                    {optionType === "calls" 
                      ? option.call.vega.toFixed(2) 
                      : option.put.vega.toFixed(2)
                    }
                  </TableCell>
                  <TableCell>
                    {optionType === "calls" 
                      ? option.call.rho.toFixed(3) 
                      : option.put.rho.toFixed(3)
                    }
                  </TableCell>
                  <TableCell>
                    {optionType === "calls" 
                      ? (option.call.iv * 100).toFixed(1) 
                      : (option.put.iv * 100).toFixed(1)
                    }%
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={viewType === "strike" ? 10 : 10} className="h-24 text-center">
                  No options data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
