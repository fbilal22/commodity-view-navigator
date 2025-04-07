
import { cn } from "@/lib/utils";

interface CommodityIconProps {
  type: 'gold' | 'silver' | 'copper' | 'aluminum' | 'cobalt' | 'other';
  className?: string;
}

export default function CommodityIcon({ type, className }: CommodityIconProps) {
  const bgColorClass = {
    'gold': 'bg-commodity-gold',
    'silver': 'bg-commodity-silver',
    'copper': 'bg-commodity-copper',
    'aluminum': 'bg-commodity-aluminum',
    'cobalt': 'bg-commodity-cobalt',
    'other': 'bg-gray-400',
  }[type];

  return (
    <div className={cn(
      "w-6 h-6 rounded-full flex items-center justify-center", 
      bgColorClass,
      className
    )}>
      {type === 'gold' && (
        <span className="text-black text-xs font-bold">Au</span>
      )}
      {type === 'silver' && (
        <span className="text-black text-xs font-bold">Ag</span>
      )}
      {type === 'copper' && (
        <span className="text-black text-xs font-bold">Cu</span>
      )}
      {type === 'aluminum' && (
        <span className="text-black text-xs font-bold">Al</span>
      )}
      {type === 'cobalt' && (
        <span className="text-black text-xs font-bold">Co</span>
      )}
      {type === 'other' && (
        <span className="text-black text-xs font-bold">?</span>
      )}
    </div>
  );
}
