
import { useEffect, useRef, useState } from "react";

interface FinlogixChartProps {
  widgetId?: string;
  symbolName?: string;
  chartShape?: "candles" | "line";
  timePeriod?: string;
}

export default function FinlogixChart({
  widgetId = "df4d6930-46a8-4229-8a79-d7902afe93dc",
  symbolName = "Apple",
  chartShape = "candles",
  timePeriod = "D1"
}: FinlogixChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initAttempts, setInitAttempts] = useState(0);
  
  useEffect(() => {
    // Clean up any previous instances
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    setIsLoading(true);
    
    // Function to initialize the widget
    const initWidget = () => {
      if (typeof window.Widget !== 'undefined' && containerRef.current) {
        // Clear previous instances
        containerRef.current.innerHTML = '';
        
        try {
          window.Widget.init({
            widgetId,
            type: "BigChart",
            language: "en",
            showBrand: true,
            isShowTradeButton: true,
            isShowBeneathLink: true,
            isShowDataFromACYInfo: true,
            symbolName,
            hasSearchBar: false,
            hasSymbolName: false,
            hasSymbolChange: false,
            hasButton: false,
            chartShape,
            timePeriod,
            isAdaptive: true,
            container: containerRef.current
          });
          console.log("Finlogix widget initialized with:", { symbolName, chartShape, timePeriod });
          setIsLoading(false);
        } catch (error) {
          console.error("Error initializing Finlogix widget:", error);
          
          // If we fail, try again after a delay (up to 3 times)
          if (initAttempts < 3) {
            setTimeout(() => {
              setInitAttempts(prev => prev + 1);
              initWidget();
            }, 1000);
          } else {
            setIsLoading(false);
          }
        }
      } else if (initAttempts < 3) {
        // If Widget is not available yet, try again after a delay
        setTimeout(() => {
          setInitAttempts(prev => prev + 1);
          initWidget();
        }, 1000);
      } else {
        console.error("Failed to initialize Finlogix widget after multiple attempts");
        setIsLoading(false);
      }
    };

    // Load the script if it doesn't exist
    if (!document.querySelector('script[src="https://widget.finlogix.com/Widget.js"]')) {
      const script = document.createElement('script');
      script.src = "https://widget.finlogix.com/Widget.js";
      script.async = true;
      script.onload = () => {
        console.log("Finlogix script loaded");
        setTimeout(initWidget, 500); // Give a small delay to ensure Widget is fully loaded
      };
      script.onerror = () => {
        console.error("Failed to load Finlogix script");
        setIsLoading(false);
      };
      document.body.appendChild(script);
    } else {
      // If script already exists, initialize widget directly
      console.log("Finlogix script already exists, initializing widget");
      setTimeout(initWidget, 500);
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [widgetId, symbolName, chartShape, timePeriod, initAttempts]); // Re-run when these props change or after retry attempts

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="finlogix-container w-full h-full min-h-[500px] rounded-md overflow-hidden"
        data-symbol={symbolName}
        data-shape={chartShape}
        data-period={timePeriod}
      ></div>
    </div>
  );
}
