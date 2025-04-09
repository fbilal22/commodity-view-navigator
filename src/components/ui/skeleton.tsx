
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Add specialized skeletons for options data
function OptionsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[120px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="border rounded-md overflow-hidden">
        <div className="grid grid-cols-11 gap-4 p-4 border-b">
          {Array(11).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-6" />
          ))}
        </div>
        <div className="space-y-2 p-2">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="grid grid-cols-11 gap-4 p-2">
              {Array(11).fill(0).map((_, j) => (
                <Skeleton key={j} className="h-6" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Skeleton, OptionsTableSkeleton }
