
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Commodity } from "@/services/api";
import CommodityIcon from "./CommodityIcon";
import PriceChange from "./PriceChange";
import TrendIndicator from "./TrendIndicator";
import { useState } from "react";
import FinlogixChart from "./FinlogixChart";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, LineChart } from "lucide-react";

interface CommoditiesTableProps {
  commodities: Commodity[];
}

export default function CommoditiesTable({ commodities }: CommoditiesTableProps) {
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);

  const toggleCommodity = (commodity: Commodity) => {
    if (selectedCommodity?.symbol === commodity.symbol) {
      setSelectedCommodity(null);
    } else {
      setSelectedCommodity(commodity);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Symbol</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change %</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">High</TableHead>
              <TableHead className="text-right">Low</TableHead>
              <TableHead className="text-right">Technical Rating</TableHead>
              <TableHead className="w-[80px]">Chart</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commodities.map((commodity) => (
              <>
                <TableRow key={commodity.symbol} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <CommodityIcon type={commodity.type} />
                      <div className="flex flex-col">
                        <span className="font-medium">{commodity.symbol}</span>
                        <span className="text-xs text-muted-foreground">{commodity.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{commodity.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <PriceChange value={commodity.percentChange} isPercentage={true} />
                  </TableCell>
                  <TableCell className="text-right">
                    <PriceChange value={commodity.absoluteChange} />
                  </TableCell>
                  <TableCell className="text-right">{commodity.high.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{commodity.low.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <TrendIndicator evaluation={commodity.technicalEvaluation} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleCommodity(commodity)}
                      className="w-full flex justify-center"
                    >
                      <LineChart className="h-4 w-4 mr-1" />
                      {selectedCommodity?.symbol === commodity.symbol ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </TableCell>
                </TableRow>
                {selectedCommodity?.symbol === commodity.symbol && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <div className="bg-muted/20 p-4">
                        <FinlogixChart 
                          symbolName={commodity.name} 
                          chartShape="candles" 
                          timePeriod="D1"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {!selectedCommodity && (
        <div className="mt-6 border rounded-md overflow-hidden">
          <FinlogixChart 
            symbolName="Gold" 
            chartShape="candles" 
            timePeriod="D1"
          />
        </div>
      )}
    </div>
  );
}
