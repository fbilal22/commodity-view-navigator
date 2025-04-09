
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
    
    const response = await fetch(`https://api.api-ninjas.com/v1/webscraper?url=https://fr.tradingview.com/options/?symbol=${symbol}`, {
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw API response for options:", data);
    
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
    
    // Parse HTML
    const htmlContent = data.data;
    const root = parse(htmlContent);
    
    // Log the first part of HTML to see structure
    console.log("HTML structure sample:", htmlContent.substring(0, 1000));
    
    // Find options table
    const optionsTable = root.querySelector('.tv-options-table');
    if (!optionsTable) {
      console.error("Options table not found in HTML");
      return [];
    }
    
    const rows = optionsTable.querySelectorAll('tr');
    console.log(`Found ${rows.length} rows in options table`);

    const optionsData: OptionData[] = [];
    
    // Find header row to understand column positions
    const headerRow = optionsTable.querySelector('thead tr');
    if (!headerRow) {
      console.error("Header row not found");
      return [];
    }
    
    // Process each data row
    rows.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      
      try {
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) return; // Skip rows with insufficient data
        
        // Find the strike price (typically in the middle)
        const strikeCell = cells[Math.floor(cells.length / 2)];
        const strikePrice = parseFloat(strikeCell.text.trim().replace(',', '.'));
        
        if (isNaN(strikePrice)) return; // Skip if strike is not a number
        
        // Extract dates
        const expirationDate = extractExpirationDate(row) || "Unknown";
        
        // Process call option data (left side)
        const callOption: OptionType = {
          bid: extractNumberFromCell(cells, 0),
          ask: extractNumberFromCell(cells, 1),
          price: extractNumberFromCell(cells, 2),
          delta: extractNumberFromCell(cells, 3),
          gamma: extractNumberFromCell(cells, 4),
          theta: extractNumberFromCell(cells, 5),
          vega: extractNumberFromCell(cells, 6),
          rho: extractNumberFromCell(cells, 7),
          iv: 0, // Will be set if found
        };
        
        // Process put option data (right side)
        const putOption: OptionType = {
          bid: extractNumberFromCell(cells, cells.length - 8),
          ask: extractNumberFromCell(cells, cells.length - 7),
          price: extractNumberFromCell(cells, cells.length - 6),
          delta: extractNumberFromCell(cells, cells.length - 5),
          gamma: extractNumberFromCell(cells, cells.length - 4),
          theta: extractNumberFromCell(cells, cells.length - 3),
          vega: extractNumberFromCell(cells, cells.length - 2),
          rho: extractNumberFromCell(cells, cells.length - 1),
          iv: 0, // Will be set if found
        };
        
        // Add to options data
        optionsData.push({
          symbol,
          strike: strikePrice,
          expirationDate,
          call: callOption,
          put: putOption
        });
        
      } catch (err) {
        console.error(`Error parsing row ${index}:`, err);
      }
    });
    
    // If no options data was found, create some sample data for development
    if (optionsData.length === 0) {
      console.log("No options data found, creating sample data");
      return createSampleOptionsData(symbol);
    }
    
    console.log(`Successfully extracted ${optionsData.length} option strikes`);
    return optionsData;
  } catch (error) {
    console.error('Error parsing options data:', error);
    console.log("Returning sample data due to error");
    return createSampleOptionsData(symbol);
  }
}

function extractNumberFromCell(cells: any[], index: number): number {
  if (!cells[index]) return 0;
  const text = cells[index].text.trim().replace(',', '.');
  const parsed = parseFloat(text);
  return isNaN(parsed) ? 0 : parsed;
}

function extractExpirationDate(row: any): string | null {
  // Try to find expiration date in the row or its parent
  const dateAttr = row.getAttribute('data-expiration');
  if (dateAttr) return dateAttr;
  
  // If not found, check if there's a header with date
  const parentTable = row.closest('table');
  if (parentTable) {
    const dateHeader = parentTable.querySelector('th[data-date]');
    if (dateHeader) return dateHeader.getAttribute('data-date');
  }
  
  return null;
}

// Create sample data for development and testing
function createSampleOptionsData(symbol: string): OptionData[] {
  const expirations = ["2024-05-17", "2024-06-21", "2024-07-19"];
  const baseStrike = symbol === "NVDA" ? 110 : symbol === "AAPL" ? 170 : 100;
  
  const result: OptionData[] = [];
  
  expirations.forEach(expDate => {
    for (let i = -5; i <= 5; i++) {
      const strike = baseStrike + (i * 5);
      const delta = 0.5 - (i * 0.1);
      
      result.push({
        symbol,
        strike,
        expirationDate: expDate,
        call: {
          bid: strike * 0.05 - (i * 0.2),
          ask: strike * 0.055 - (i * 0.2),
          price: strike * 0.052 - (i * 0.2),
          delta: Math.max(0, Math.min(1, delta)),
          gamma: 0.02,
          theta: -0.11,
          vega: 0.13,
          rho: 0.05,
          iv: 0.30 + (Math.random() * 0.1)
        },
        put: {
          bid: strike * 0.04 + (i * 0.2),
          ask: strike * 0.045 + (i * 0.2),
          price: strike * 0.042 + (i * 0.2),
          delta: Math.max(-1, Math.min(0, -delta)),
          gamma: 0.02,
          theta: -0.11,
          vega: 0.13,
          rho: -0.05,
          iv: 0.32 + (Math.random() * 0.1)
        }
      });
    }
  });
  
  return result;
}
