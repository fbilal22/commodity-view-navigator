
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  evaluation: string;
  className?: string;
}

export default function TrendIndicator({ evaluation, className }: TrendIndicatorProps) {
  const isBuy = evaluation.toLowerCase().includes('buy');
  const isSell = evaluation.toLowerCase().includes('sell');
  const isStrong = evaluation.toLowerCase().includes('strong');
  
  const colorClass = isBuy 
    ? 'text-trend-up' 
    : isSell 
      ? 'text-trend-down' 
      : 'text-trend-neutral';
      
  return (
    <div className={cn("flex items-center gap-1", colorClass, className)}>
      {isBuy && (
        <ArrowUp 
          size={16} 
          className={cn(
            "text-trend-up",
            isStrong && "font-bold"
          )} 
        />
      )}
      {isSell && (
        <ArrowDown 
          size={16} 
          className={cn(
            "text-trend-down",
            isStrong && "font-bold"
          )} 
        />
      )}
      {!isBuy && !isSell && (
        <Minus size={16} className="text-trend-neutral" />
      )}
      <span className={cn(
        "text-sm",
        isStrong && "font-semibold"
      )}>
        {evaluation}
      </span>
    </div>
  );
}
