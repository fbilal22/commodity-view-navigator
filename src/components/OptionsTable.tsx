
import { useState } from "react";
import { OptionData, OptionsViewType } from "@/types/options";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OptionsTableProps {
  optionsData: OptionData[];
  viewType: OptionsViewType;
}

export default function OptionsTable({ optionsData, viewType }: OptionsTableProps) {
  const [selectedExpiration, setSelectedExpiration] = useState<string | null>(null);
  const [optionType, setOptionType] = useState<"calls" | "puts">("calls");
  
  // Get unique expiration dates
  const expirationDates = [...new Set(optionsData.map(item => item.expirationDate))];
  
  // If no expiration is selected, use the first one
  const currentExpiration = selectedExpiration || expirationDates[0] || "";
  
  // Filter data based on selected expiration
  const filteredData = optionsData.filter(item => item.expirationDate === currentExpiration);
  
  // Sort by strike price
  const sortedData = [...filteredData].sort((a, b) => a.strike - b.strike);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Tabs value={optionType} onValueChange={(value) => setOptionType(value as "calls" | "puts")}>
            <TabsList>
              <TabsTrigger value="calls">Calls</TabsTrigger>
              <TabsTrigger value="puts">Puts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {expirationDates.length > 0 && (
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
      </div>
      
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strike</TableHead>
              <TableHead>Bid</TableHead>
              <TableHead>Ask</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Delta</TableHead>
              <TableHead>Gamma</TableHead>
              <TableHead>Theta</TableHead>
              <TableHead>Vega</TableHead>
              <TableHead>Rho</TableHead>
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
                  <TableCell className="font-medium">{option.strike.toFixed(2)}</TableCell>
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
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
