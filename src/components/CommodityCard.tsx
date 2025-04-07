
import { Card, CardContent } from "@/components/ui/card";
import { Commodity } from "@/services/api";
import CommodityIcon from "./CommodityIcon";
import PriceChange from "./PriceChange";

interface CommodityCardProps {
  commodity: Commodity;
}

export default function CommodityCard({ commodity }: CommodityCardProps) {
  return (
    <Card className="overflow-hidden h-full border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <CommodityIcon type={commodity.type} />
          <div className="flex flex-col">
            <h3 className="font-bold text-sm">{commodity.name}</h3>
            <span className="text-xs text-muted-foreground">{commodity.symbol}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-end mt-3">
          <div className="flex-1">
            <div className="text-2xl font-bold">{commodity.price.toLocaleString()}</div>
            <div className="flex gap-2 mt-1">
              <PriceChange value={commodity.percentChange} isPercentage={true} className="text-sm" />
              <PriceChange value={commodity.absoluteChange} className="text-sm" />
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground">H:</span>
              <span>{commodity.high.toLocaleString()}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground">L:</span>
              <span>{commodity.low.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
