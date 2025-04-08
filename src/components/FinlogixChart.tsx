
import { useEffect, useRef } from "react";

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
  const initialized = useRef(false);

  useEffect(() => {
    // Load the Finlogix widget script
    if (!document.querySelector('script[src="https://widget.finlogix.com/Widget.js"]')) {
      const script = document.createElement('script');
      script.src = "https://widget.finlogix.com/Widget.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (containerRef.current && !initialized.current) {
          initialized.current = true;
          initWidget();
        }
      };
      document.body.appendChild(script);
    } else if (!initialized.current && containerRef.current) {
      // If script already exists but widget not initialized
      initialized.current = true;
      setTimeout(initWidget, 100); // Give a small delay to ensure Widget is available
    }

    function initWidget() {
      if (typeof window.Widget !== 'undefined') {
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
      }
    }

    return () => {
      initialized.current = false;
    };
  }, [widgetId, symbolName, chartShape, timePeriod]);

  return <div ref={containerRef} className="finlogix-container w-full h-[500px] rounded-md overflow-hidden"></div>;
}
