
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Commodity } from "@/services/api";
import CommodityIcon from "./CommodityIcon";
import PriceChange from "./PriceChange";
import TrendIndicator from "./TrendIndicator";

interface CommoditiesTableProps {
  commodities: Commodity[];
}

export default function CommoditiesTable({ commodities }: CommoditiesTableProps) {
  return (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {commodities.map((commodity) => (
            <TableRow key={commodity.symbol}>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
