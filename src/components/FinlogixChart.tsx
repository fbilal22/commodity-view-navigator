
import { useEffect, useRef, useState } from "react";

interface FinlogixChartProps {
  widgetId?: string;
  symbolName?: string;
  chartShape?: "candles" | "line";
  timePeriod?: string;
}

interface WidgetInstance {
  init: (options: any) => void;
}

declare global {
  interface Window {
    Widget: WidgetInstance;
  }
}

export default function FinlogixChart({
  widgetId = "df4d6930-46a8-4229-8a79-d7902afe93dc",
  symbolName = "Apple",
  chartShape = "candles",
  timePeriod = "D1"
}: FinlogixChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Clean up any previous instances
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    setIsLoading(true);
    
    // Create the exact HTML structure as provided
    const createWidgetHTML = () => {
      if (!containerRef.current) return;
      
      // Create and append the finlogix container
      const finlogixContainer = document.createElement('div');
      finlogixContainer.className = 'finlogix-container';
      containerRef.current.appendChild(finlogixContainer);
      
      // Create and add the Widget.js script if it doesn't exist
      if (!document.querySelector('script[src="https://widget.finlogix.com/Widget.js"]')) {
        const script = document.createElement('script');
        script.src = "https://widget.finlogix.com/Widget.js";
        script.async = true;
        script.onload = initializeWidget;
        document.body.appendChild(script);
      } else {
        // If the script is already loaded, initialize the widget directly
        initializeWidget();
      }
    };
    
    // Initialize the widget with the exact configuration
    const initializeWidget = () => {
      if (typeof window.Widget !== 'undefined' && containerRef.current) {
        try {
          // Fix the type error by ensuring we get an HTMLElement instead of Element
          const container = containerRef.current.querySelector('.finlogix-container') as HTMLElement;
          if (!container) return;
          
          window.Widget.init({
            widgetId: widgetId,
            type: "BigChart",
            language: "en",
            showBrand: true,
            isShowTradeButton: true,
            isShowBeneathLink: true,
            isShowDataFromACYInfo: true,
            symbolName: symbolName,
            hasSearchBar: false,
            hasSymbolName: false,
            hasSymbolChange: false,
            hasButton: false,
            chartShape: chartShape,
            timePeriod: timePeriod,
            isAdaptive: true,
            container: container // Add the required container property
          });
          console.log("Finlogix widget initialized with:", { symbolName, chartShape, timePeriod });
          setIsLoading(false);
        } catch (error) {
          console.error("Error initializing Finlogix widget:", error);
          setIsLoading(false);
        }
      } else {
        console.error("Widget is not defined");
        setIsLoading(false);
      }
    };
    
    createWidgetHTML();
    
    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [widgetId, symbolName, chartShape, timePeriod]); // Re-run when these props change

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[500px] rounded-md overflow-hidden"
        data-symbol={symbolName}
        data-shape={chartShape}
        data-period={timePeriod}
      ></div>
    </div>
  );
}
