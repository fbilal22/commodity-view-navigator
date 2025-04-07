
import { toast } from "sonner";

// Clé API fournie
const API_KEY = 'V06SpYv2b/ptbqPxnvvhtg==3F5KAONfyIW0JKVl';

// Interfaces pour les données des matières premières
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
 * Récupère les données des matières premières depuis TradingView via l'API Ninja
 */
export async function fetchCommoditiesData(): Promise<Commodity[]> {
  try {
    const response = await fetch('https://api.api-ninjas.com/v1/webscraper?url=https://fr.tradingview.com/markets/futures/quotes-metals/', {
      headers: {
        'X-Api-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    
    // Analyse du HTML récupéré pour extraire les données des matières premières
    return parseCommoditiesData(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    toast.error('Erreur lors de la récupération des données');
    return [];
  }
}

/**
 * Détermine le type de matière première à partir du symbole ou du nom
 */
function getCommodityType(symbol: string, name: string): Commodity['type'] {
  const lowerSymbol = symbol.toLowerCase();
  const lowerName = name.toLowerCase();
  
  if (lowerSymbol.includes('au') || lowerName.includes('gold') || lowerName.includes('or')) {
    return 'gold';
  } else if (lowerSymbol.includes('ag') || lowerName.includes('silver') || lowerName.includes('argent')) {
    return 'silver';
  } else if (lowerSymbol.includes('ca') || lowerName.includes('copper') || lowerName.includes('cuivre')) {
    return 'copper';
  } else if (lowerSymbol.includes('al') || lowerName.includes('alum')) {
    return 'aluminum';
  } else if (lowerSymbol.includes('co') || lowerName.includes('cobalt')) {
    return 'cobalt';
  }
  
  return 'other';
}

/**
 * Analyse les données HTML pour extraire les informations des matières premières
 */
function parseCommoditiesData(data: any): Commodity[] {
  try {
    // Utilisation de données fictives temporaires jusqu'à ce que nous puissions analyser correctement le HTML
    // Dans une implémentation réelle, nous analyserions le HTML pour extraire les données
    const mockData: Commodity[] = [
      {
        symbol: "1OZ!",
        name: "1-Ounce Gold Futures",
        price: 3042.75,
        percentChange: 0.24,
        absoluteChange: 7.25,
        high: 3081.75,
        low: 2988.00,
        technicalEvaluation: "Neutre",
        type: 'gold'
      },
      {
        symbol: "AG!",
        name: "Silver Futures",
        price: 7663,
        percentChange: -8.48,
        absoluteChange: -710,
        high: 7815,
        low: 7535,
        technicalEvaluation: "Strong Sell",
        type: 'silver'
      },
      {
        symbol: "AH!",
        name: "Aluminium High Grade Futures",
        price: 2339.50,
        percentChange: -1.02,
        absoluteChange: -24.03,
        high: 2352.50,
        low: 2339.50,
        technicalEvaluation: "Strong Sell",
        type: 'aluminum'
      },
      {
        symbol: "AL!",
        name: "Aluminum Futures",
        price: 19545,
        percentChange: -4.36,
        absoluteChange: -890,
        high: 19905,
        low: 19000,
        technicalEvaluation: "Strong Sell",
        type: 'aluminum'
      },
      {
        symbol: "ALH!",
        name: "Aluminum Futures",
        price: 2209.50,
        percentChange: -3.78,
        absoluteChange: -86.75,
        high: 2209.50,
        low: 2209.50,
        technicalEvaluation: "Strong Sell",
        type: 'aluminum'
      },
      {
        symbol: "ALUMIN!",
        name: "Aluminium Mini Futures",
        price: 230.45,
        percentChange: -0.99,
        absoluteChange: -2.30,
        high: 235.85,
        low: 229.85,
        technicalEvaluation: "Strong Sell",
        type: 'aluminum'
      },
      {
        symbol: "ALUMINIUM!",
        name: "Aluminium Futures",
        price: 230.35,
        percentChange: -0.80,
        absoluteChange: -1.85,
        high: 235.85,
        low: 229.75,
        technicalEvaluation: "Strong Sell",
        type: 'aluminum'
      },
      {
        symbol: "AU!",
        name: "Gold Futures",
        price: 716.58,
        percentChange: -3.06,
        absoluteChange: -22.64,
        high: 728.00,
        low: 701.00,
        technicalEvaluation: "Buy",
        type: 'gold'
      },
      {
        symbol: "CA!",
        name: "Grade A Copper Futures",
        price: 8765.00,
        percentChange: 0.12,
        absoluteChange: 10.74,
        high: 8943.00,
        low: 8223.00,
        technicalEvaluation: "Sell",
        type: 'copper'
      },
      {
        symbol: "CO!",
        name: "Cobalt Futures",
        price: 33300,
        percentChange: -0.74,
        absoluteChange: -245,
        high: 33300,
        low: 33300,
        technicalEvaluation: "Neutre",
        type: 'cobalt'
      },
      {
        symbol: "COB!",
        name: "Cobalt Metal (Fastmarkets) Futures",
        price: 15.85,
        percentChange: -7.31,
        absoluteChange: -1.25,
        high: 15.85,
        low: 15.85,
        technicalEvaluation: "Buy",
        type: 'cobalt'
      },
      {
        symbol: "COPPER!",
        name: "Copper Futures",
        price: 801.60,
        percentChange: -0.40,
        absoluteChange: -3.20,
        high: 826.40,
        low: 792.20,
        technicalEvaluation: "Strong Sell",
        type: 'copper'
      }
    ];

    // Dans une implémentation réelle, nous analyserions le HTML pour extraire les données
    // Pour cela, nous pourrions utiliser une bibliothèque comme cheerio

    return mockData;
  } catch (error) {
    console.error('Erreur lors de l\'analyse des données:', error);
    return [];
  }
}
