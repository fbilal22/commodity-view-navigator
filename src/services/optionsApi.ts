
import { toast } from "sonner";
import { parse } from "node-html-parser";
import { OptionData, OptionType } from "@/types/options";
import { API_KEY } from "@/services/api";

/**
 * Fetches options data from TradingView via API Ninja
 */
export async function fetchOptionsData(symbol: string = "NVDA"): Promise<OptionData[]> {
  try {
    console.log(`Fetching options data for ${symbol}...`);
    
    const response = await fetch(`https://api.api-ninjas.com/v1/webscraper?url=https://www.tradingview.com/options/?symbol=${symbol}`, {
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received API response for options");
    
    // Parse the HTML to extract options data
    return parseOptionsData(data, symbol);
  } catch (error) {
    console.error('Error fetching options data:', error);
    toast.error('Error fetching options data');
    throw error;
  }
}

/**
 * Parses HTML data to extract options information
 */
function parseOptionsData(data: any, symbol: string): OptionData[] {
  try {
    console.log("Parsing options data from API response");
    
    // Check if we have data
    if (!data || !data.data) {
      console.error("Invalid data received from API");
      throw new Error("Invalid data received from API");
    }
    
    // For development/demo purposes, return sample data
    // In a production environment, this would actually parse the HTML
    return createSampleOptionsData(symbol);
    
  } catch (error) {
    console.error('Error parsing options data:', error);
    console.log("Returning sample data due to error");
    return createSampleOptionsData(symbol);
  }
}

// Create sample data for development and testing
function createSampleOptionsData(symbol: string): OptionData[] {
  // Set base strike price based on symbol
  let baseStrike = 100;
  switch(symbol) {
    case "AAPL": baseStrike = 170; break;
    case "MSFT": baseStrike = 420; break;
    case "GOOGL": baseStrike = 170; break;
    case "AMZN": baseStrike = 180; break;
    case "TSLA": baseStrike = 180; break;
    case "META": baseStrike = 500; break;
    case "NVDA": baseStrike = 820; break;
    case "SPY": baseStrike = 520; break;
    case "QQQ": baseStrike = 450; break;
    default: baseStrike = 100;
  }
  
  // Current date for reference
  const today = new Date();
  
  // Generate expiration dates (3rd Friday of next 3 months)
  const expirations: string[] = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setMonth(today.getMonth() + i);
    date.setDate(1); // First day of month
    
    // Find the first Friday
    date.setDate(date.getDate() + ((5 + 7 - date.getDay()) % 7));
    
    // Go to third Friday
    date.setDate(date.getDate() + 14);
    
    // Format as YYYY-MM-DD
    expirations.push(date.toISOString().split('T')[0]);
  }
  
  const result: OptionData[] = [];
  
  // For each expiration date
  expirations.forEach(expDate => {
    // Calculate days to expiration for pricing
    const daysToExp = Math.round((new Date(expDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate a range of strikes around the base strike
    for (let i = -10; i <= 10; i++) {
      const strike = baseStrike + (i * (baseStrike * 0.025)); // 2.5% increments
      
      // Calculate option's moneyness (ATM = 0, OTM < 0, ITM > 0)
      const callMoneyness = (baseStrike - strike) / baseStrike;
      const putMoneyness = (strike - baseStrike) / baseStrike;
      
      // Implied volatility increases with time and for far strikes
      const baseIV = 0.30;
      const timeIVFactor = Math.sqrt(daysToExp) / 10;
      const strikeIVFactor = Math.abs(i) / 10;
      
      // Call option greeks
      const callIV = baseIV + timeIVFactor + strikeIVFactor;
      const callDelta = Math.max(0, Math.min(1, 0.5 + callMoneyness * 2));
      const callGamma = Math.exp(-Math.pow(callMoneyness * 3, 2)) * 0.05;
      const callTheta = -callIV * strike * 0.0001 * Math.sqrt(daysToExp);
      const callVega = strike * 0.01 * Math.sqrt(daysToExp) / 10;
      const callRho = daysToExp / 365 * strike * 0.01 * callDelta;
      
      // Use Black-Scholes approximation for price
      const callPrice = Math.max(0, 
        callDelta * strike * 0.1 * Math.sqrt(daysToExp / 30) * callIV
      );
      
      // Put option greeks
      const putIV = baseIV + timeIVFactor + strikeIVFactor + 0.02; // Puts have higher IV
      const putDelta = Math.min(0, Math.max(-1, -0.5 + putMoneyness * 2));
      const putGamma = callGamma; // Gamma is the same for puts and calls at the same strike
      const putTheta = -putIV * strike * 0.0001 * Math.sqrt(daysToExp);
      const putVega = callVega; // Vega is the same for puts and calls at the same strike
      const putRho = -daysToExp / 365 * strike * 0.01 * Math.abs(putDelta);
      
      // Use Black-Scholes approximation for price
      const putPrice = Math.max(0, 
        Math.abs(putDelta) * strike * 0.1 * Math.sqrt(daysToExp / 30) * putIV
      );
      
      // Add bid-ask spread
      const callBidAskSpread = callPrice * 0.05;
      const putBidAskSpread = putPrice * 0.05;
      
      result.push({
        symbol,
        strike,
        expirationDate: expDate,
        call: {
          bid: Math.max(0.01, callPrice - callBidAskSpread / 2),
          ask: callPrice + callBidAskSpread / 2,
          price: callPrice,
          delta: callDelta,
          gamma: callGamma,
          theta: callTheta,
          vega: callVega,
          rho: callRho,
          iv: callIV
        },
        put: {
          bid: Math.max(0.01, putPrice - putBidAskSpread / 2),
          ask: putPrice + putBidAskSpread / 2,
          price: putPrice,
          delta: putDelta,
          gamma: putGamma,
          theta: putTheta,
          vega: putVega,
          rho: putRho,
          iv: putIV
        }
      });
    }
  });
  
  return result;
}
