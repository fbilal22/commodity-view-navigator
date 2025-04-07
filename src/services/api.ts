
import { toast } from "sonner";
import { parse } from "node-html-parser";

// API key variable that can be updated
let API_KEY = 'V06SpYv2b/ptbqPxnvvhtg==3F5KAONfyIW0JKVl';

// Function to update the API key
export function updateApiKey(newKey: string) {
  API_KEY = newKey;
}

// Function to validate the API key
export async function validateApiKey(key: string): Promise<boolean> {
  try {
    // Test the API with the provided key
    const response = await fetch('https://api.api-ninjas.com/v1/webscraper?url=https://www.tradingview.com/markets/futures/quotes-metals/', {
      headers: {
        'X-Api-Key': key
      }
    });

    if (!response.ok) {
      return false;
    }

    // If we get a successful response, the key is valid
    const data = await response.json();
    return !!data && !!data.data;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
}

// Interfaces for commodity data
export interface Commodity {
  symbol: string;
  name: string;
  price: number;
  percentChange: number;
  absoluteChange: number;
  high: number;
  low: number;
  technicalEvaluation: string;
  type: 'gold' | 'silver' | 'copper' | 'aluminum' | 'cobalt' | 'other';
}

/**
 * Fetches commodity data from TradingView via the API Ninja
 */
export async function fetchCommoditiesData(): Promise<Commodity[]> {
  try {
    // Show loading message
    console.log("Fetching data from TradingView...");
    
    const response = await fetch('https://api.api-ninjas.com/v1/webscraper?url=https://www.tradingview.com/markets/futures/quotes-metals/', {
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw API response:", data);
    
    // Parse the HTML retrieved to extract commodity data
    return parseCommoditiesData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    toast.error('Error fetching data');
    throw error; // Propagate the error instead of returning empty array
  }
}

/**
 * Determines the type of commodity from symbol or name
 */
function getCommodityType(symbol: string, name: string): Commodity['type'] {
  const lowerSymbol = symbol.toLowerCase();
  const lowerName = name.toLowerCase();
  
  if (lowerSymbol.includes('au') || lowerName.includes('gold') || lowerName.includes('or')) {
    return 'gold';
  } else if (lowerSymbol.includes('ag') || lowerName.includes('silver') || lowerName.includes('argent')) {
    return 'silver';
  } else if (lowerSymbol.includes('cu') || lowerName.includes('copper') || lowerName.includes('cuivre')) {
    return 'copper';
  } else if (lowerSymbol.includes('al') || lowerName.includes('alum')) {
    return 'aluminum';
  } else if (lowerSymbol.includes('co') || lowerName.includes('cobalt')) {
    return 'cobalt';
  }
  
  return 'other';
}

/**
 * Parses HTML data to extract commodity information
 */
function parseCommoditiesData(data: any): Commodity[] {
  try {
    console.log("Parsing data from API response");
    
    // Check if we have data
    if (!data || !data.data) {
      console.error("Invalid data received from API");
      throw new Error("Invalid data received from API");
    }
    
    // Parse HTML
    const htmlContent = data.data;
    console.log("HTML content length:", htmlContent.length);
    
    // Use node-html-parser to analyze HTML
    const root = parse(htmlContent);
    
    // Log the full HTML to see its structure
    console.log("HTML structure:", root.toString().substring(0, 1000));
    
    // Try different selections to find data
    // Selection 1: Data tables
    let commodityRows = root.querySelectorAll('.tv-data-table__row');
    console.log("Data table rows found:", commodityRows.length);
    
    // Selection 2: If selection 1 doesn't work, try another selection
    if (!commodityRows || commodityRows.length === 0) {
      commodityRows = root.querySelectorAll('tr[data-rowid]');
      console.log("Row data found with tr[data-rowid]:", commodityRows.length);
    }

    // Selection 3: Try a more generic selection
    if (!commodityRows || commodityRows.length === 0) {
      commodityRows = root.querySelectorAll('table tr');
      console.log("Generic table rows found:", commodityRows.length);
    }
    
    if (!commodityRows || commodityRows.length === 0) {
      console.error("No commodity rows found in HTML");
      // Log a sample of the HTML for debugging
      console.log("HTML sample:", htmlContent.substring(0, 1000));
      throw new Error("Failed to extract data");
    }
    
    const commodities: Commodity[] = [];
    
    commodityRows.forEach((row, index) => {
      try {
        console.log(`Processing row ${index}:`, row.toString().substring(0, 200));
        
        // Extract data from each cell
        const cells = row.querySelectorAll('td');
        
        if (!cells || cells.length < 6) {
          console.log(`Row ${index}: Not enough cells (${cells?.length || 0}), skipping`);
          return; // Incomplete row, skip
        }
        
        // Extract symbol and name
        const firstCell = cells[0];
        console.log(`Row ${index}, First cell:`, firstCell.toString());
        
        let symbol = '';
        let name = '';
        
        // Try to extract symbol and name with different methods
        const symbolElement = firstCell.querySelector('.symbol-name');
        if (symbolElement) {
          symbol = symbolElement.text.trim();
          name = symbolElement.getAttribute('title') || '';
        } else {
          // Another extraction method
          const allText = firstCell.text.trim();
          const parts = allText.split(/\s+/);
          symbol = parts[0] || '';
          name = parts.slice(1).join(' ');
        }
        
        if (!symbol) {
          console.log(`Row ${index}: No symbol found, skipping`);
          return;
        }
        
        // Extract other information
        console.log(`Row ${index}: Processing price from cell 1`);
        const priceText = cells[1]?.text.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        const price = parseFloat(priceText) || 0;
        
        console.log(`Row ${index}: Processing percent change from cell 2`);
        const percentChangeText = cells[2]?.text.trim().replace(/[^-\d.,]/g, '').replace(',', '.');
        const percentChange = parseFloat(percentChangeText) || 0;
        
        console.log(`Row ${index}: Processing absolute change from cell 3`);
        const absoluteChangeText = cells[3]?.text.trim().replace(/[^-\d.,]/g, '').replace(',', '.');
        const absoluteChange = parseFloat(absoluteChangeText) || 0;
        
        console.log(`Row ${index}: Processing high from cell 4`);
        const highText = cells[4]?.text.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        const high = parseFloat(highText) || 0;
        
        console.log(`Row ${index}: Processing low from cell 5`);
        const lowText = cells[5]?.text.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        const low = parseFloat(lowText) || 0;
        
        // Technical evaluation (if available)
        console.log(`Row ${index}: Processing evaluation from cell 6`);
        const technicalEvaluation = cells[6]?.text.trim() || 'Neutral';
        
        // Determine commodity type
        const type = getCommodityType(symbol, name);
        
        commodities.push({
          symbol,
          name,
          price,
          percentChange,
          absoluteChange,
          high,
          low,
          technicalEvaluation,
          type
        });
        
        console.log(`Successfully processed commodity: ${symbol}`);
      } catch (err) {
        console.error(`Error parsing row ${index}:`, err);
      }
    });
    
    if (commodities.length === 0) {
      console.error("No commodities could be extracted");
      throw new Error("No commodities could be extracted");
    }
    
    console.log(`Successfully extracted ${commodities.length} commodities`);
    return commodities;
  } catch (error) {
    console.error('Error parsing data:', error);
    throw error;
  }
}
